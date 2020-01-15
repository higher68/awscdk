import { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
// aws-sdk/clients/dynamodbを使うと、dynamodbの操作を簡単にできる
// updateiteminputはupdateitemに渡すパラメータ用のinterface
// API Gatewayから受け取ったデータを元に挨拶文を作成、DynamoDBへ保存
import * as AWS from 'aws-sdk';

const EnvironmentVariableSample = process.env.GREETING_TABLE_NAME!;
const Region = process.env.REGION!;
// https://dev.classmethod.jp/server-side/typescript-assertions/
// !をつけるとコンパイラにnon-nullと教えられる
// process.envで環境変数を取ってこれる

const DYNAMO = new AWS.DynamoDB(
    {
        apiVersion: '2012-08-10',
        region: Region
    }
);

export async function handler(event: User): Promise<GreetingMessage> {
    return HelloWorldUseCase.hello(event);
}

export class HelloWorldUseCase {

    public static async hello(userInfo: User): Promise<GreetingMessage> {
        const message = HelloWorldUseCase.createMessage(userInfo);
        // messageを作成
        await DynamodbGreetingTable.greetingStore(message);
        // tableに登録
        return message;
    }

    private static createMessage(userInfo: User): GreetingMessage {
        // jsonをreturnした時、それをしていした型にできるらしい
        // 今回だと、jsonをGreetingMessageで出してる
        return {
            title: `hello, ${userInfo.name}`,
            description: 'my first message.',
        }
    }
}

export class DynamodbGreetingTable {
    public static async greetingStore(greeting: GreetingMessage): Promise<void> {
        const params: UpdateItemInput = {
            TableName: EnvironmentVariableSample,
            Key: { greetingId: { S: 'hello-cdk-item' } },
            UpdateExpression: [
                'set title = :title',
                'description = :description'
            ].join(', '),
            ExpressionAttributeValues: {
                ':title': { S: greeting.title },
                ':description': { S: greeting.description }
            }
        };
        // dynamoに入れるパラメータ定義
        // joinを使うと、二つの文字列を任意の区切り文字で連結できる

        await DYNAMO.updateItem(params).promise()
    }
}
export interface User {
    name: string;
}
export interface GreetingMessage {
    title: string;
    description: string;
}