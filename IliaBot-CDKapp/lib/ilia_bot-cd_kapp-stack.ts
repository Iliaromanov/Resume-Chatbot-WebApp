import * as cdk from 'aws-cdk-lib';
import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import { RuleTargetInput } from 'aws-cdk-lib/aws-events';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as logs from 'aws-cdk-lib/aws-logs';
import { BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';


const LAMBDA_CONFIG_ENV : {[key:string]: {[key:string]:any}} = {
  "dev": {
    "SESSION_COOKIE_SECURE": false,
    "DEBUG": true,
    "TEMPLATES_AUTO_RELOAD": true,
    "SEND_FILE_MAX_AGE_DEFAULT": 300,
    "PERMANENT_SESSION_LIFETIME": 86400, // 1 day
    "ROOT_LOG_LEVEL": "DEBUG"
  },
  'staging': {
    "SESSION_COOKIE_SECURE": true,
    "DEBUG": false,
    "TEMPLATES_AUTO_RELOAD": false,
    "SEND_FILE_MAX_AGE_DEFAULT": 300,
    "PERMANENT_SESSION_LIFETIME": 86400, // 1 day,
    "ROOT_LOG_LEVEL": "DEBUG"
  },
  "prod": {
    "SESSION_COOKIE_SECURE": true,
    "DEBUG": false,
    "TEMPLATES_AUTO_RELOAD": false,
    "SEND_FILE_MAX_AGE_DEFAULT": 300,
    "PERMANENT_SESSION_LIFETIME": 86400, // 1 day
    "ROOT_LOG_LEVEL": "INFO"
  }
};

// For apigw throttling options to limit requests/second 
//  and avoid unwated billing issues and apply
//  token-buck style throttling to web app
//  (https://en.wikipedia.org/wiki/Token_bucket)
const MAX_RPS = 100; 
const MAX_RPS_BUCKET_SIZE = 1000;


export class IliaBotCdKappStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stageName = this.node.tryGetContext("stage") as string;

    // IAM role for lambda which grants access to logs and cloudwatch metrics
    //  and can be used later to grant lambda r/w permissions to other resources
    let lambdaRole = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        "lambda-executor": new iam.PolicyDocument({
          assignSids: true,
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["ec2:DescribeTags",
                "cloudwatch:GetMetricStatistics",
                "cloudwatch:ListMetrics",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogStreams"],
              resources: ["*"]
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: ["*"]
            })
          ]
        })
      }
    });

    let lambdaEnv = LAMBDA_CONFIG_ENV[stageName];

    let webappLambda = new lambda.Function(this, "IliaBotLambda", {
      functionName: `stock-trade-lambda-${stageName}`,
      code: lambda.Code.fromAsset(__dirname + "/../build-python",), // created in Makefile
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: "serverless_flask.lambda.lambda_handler",
      role: lambdaRole,
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        "JSON_CONFIG_OVERRIDE": JSON.stringify(lambdaEnv),
        // the below will be added manually through AWS console
        "MONGODB_PASS": "SECRET"
      },
      // logRetention: logs.RetentionDays.SIX_MONTHS, // default is infinite
    });

    let restApi = new apigw.LambdaRestApi(this, "IliaBotLambdaRestApi", {
      restApiName: `iliabot-api-${stageName}`,
      handler: webappLambda,
      // set to all types to simplify handling of all content types
      binaryMediaTypes: ["*/*"],
      // apply token-bucket style throttling
      // (check comment at globals definition above for more info)
      deployOptions: {
        throttlingBurstLimit: MAX_RPS_BUCKET_SIZE,
        throttlingRateLimit: MAX_RPS
      }
    });
    const restApiUrl = `${restApi.restApiId}.execute-api.${this.region}.amazonaws.com`;

    // Fronting the API with CloudFront to:
    // 1. Remove stage name prefix from url (eg. /prod/my-url => /my-url)
    // 2. For caching responses
    if (this.node.tryGetContext("stage") !== "dev") { // no need for cdn in dev
      let cdn = new cloudfront.Distribution(this, "CDN", {
        defaultBehavior: {
          // CloudFront function to modify "Host" header to pass to lanbda; modifies
          //  the request object and puts "Host" value into "x-forwarded-host" to allow
          //  access from lambda. (needed because apigw overwrites the "Host" field)
          // https://stackoverflow.com/questions/39222208/forwarding-cloudfront-host-header-to-api-gateway
          functionAssociations: [{
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: new cloudfront.Function(this, "RewriteCdnHost", {
              functionName: `${this.account}${this.stackName}RewriteCdnHostFunction${stageName}`,
              // documentation: 
              //https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-event-structure.html#functions-event-structure-example
              code: cloudfront.FunctionCode.fromInline(`
              function handler(event) {
                var req = event.request;
                if (req.headers['host']) {
                  req.headers['x-forwarded-host'] = {
                    value: req.headers['host'].value
                  };
                }
                return req;
              }
              `)
            })
          }],
          origin: new origins.HttpOrigin(restApiUrl, {
            originPath: "/prod",
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
            connectionAttempts: 3,
            connectionTimeout: Duration.seconds(10),
            httpsPort: 443,
          }),
          smoothStreaming: false,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          compress: true,
          cachePolicy: new cloudfront.CachePolicy(this, 'DefaultCachePolicy', {
              // need to be overriden because the names are not automatically randomized across stages
              cachePolicyName: `CachePolicy-${stageName}`,
              headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList("x-forwarded-host"),
              // allow Flask session variable
              cookieBehavior: cloudfront.CacheCookieBehavior.allowList("session"),
              queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
              maxTtl: Duration.hours(1),
              defaultTtl: Duration.minutes(5),
              enableAcceptEncodingGzip: true,
              enableAcceptEncodingBrotli: true
          }),
        },
        //https://notes.serverlessfirst.com/public/What+Pricing+Class+should+I+choose+for+a+CloudFront+distribution
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // North America + Europe
        enabled: true,
        httpVersion: cloudfront.HttpVersion.HTTP2,
      });
      new CfnOutput(this, "CDNDomain", {
        value: "https://" + cdn.distributionDomainName
      });
    }
  }
}