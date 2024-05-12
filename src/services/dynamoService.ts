import dynamodb from 'dynamodb';
import {AWS_REGION,AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN} from '../config';

dynamodb.AWS.config.update({
    accessKeyId:AWS_ACCESS_KEY_ID,
    secretAccessKey:AWS_SECRET_ACCESS_KEY,
    //Unicamente al utilizar AWS Academy
    sessionToken:AWS_SESSION_TOKEN,
    region:AWS_REGION
});

export default dynamodb;