import {Construct, Stack, StackProps} from "@aws-cdk/core";
import {AuthorizationType} from "@aws-cdk/aws-apigateway";
import {Code, Runtime} from "@aws-cdk/aws-lambda";
import {AttributeType, BillingMode} from "@aws-cdk/aws-dynamodb";
import {ApiGatewayToLambda} from '@aws-solutions-constructs/aws-apigateway-lambda';
import {LambdaToDynamoDB} from '@aws-solutions-constructs/aws-lambda-dynamodb';
import {DynamoDBStreamToLambda} from '@aws-solutions-constructs/aws-dynamodb-stream-lambda';

export class SolutionConstructExampleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const ddbAndStream = new DynamoDBStreamToLambda(this, 'subscriber', {
            deployLambda: true,
            lambdaFunctionProps: {
                runtime: Runtime.NODEJS_12_X,
                handler: 'index.subscriber',
                code: Code.fromAsset(`${__dirname}/lambda`)
            },
            dynamoTableProps:{
                partitionKey: {
                    name: "pk",
                    type:AttributeType.STRING
                },
                sortKey: {
                    name: "sk",
                    type:AttributeType.STRING
                },
                billingMode: BillingMode.PROVISIONED
            }

        });


        const apig2lambda = new ApiGatewayToLambda(this, 'api', {
            deployLambda: true,
            lambdaFunctionProps: {
                runtime: Runtime.NODEJS_12_X,
                handler: 'index.handler',
                code: Code.fromAsset(`${__dirname}/lambda`),
                environment: {
                    TABLE: ddbAndStream.dynamoTable.tableName
                }
            },
            apiGatewayProps: {
                defaultMethodOptions: {
                    authorizationType: AuthorizationType.NONE
                }
            }
        });

        new LambdaToDynamoDB(this, 'businesslogic', {
            deployLambda: false,
            existingLambdaObj: apig2lambda.lambdaFunction,
            existingTableObj: ddbAndStream.dynamoTable
        });
    }
}
