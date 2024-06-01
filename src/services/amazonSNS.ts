/*Autor: Abigail Donají Chávez Rubio
Configuration of the Amazon SNS service */
import AWS from 'aws-sdk';
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} from '../config';

AWS.config.update({
    accessKeyId:AWS_ACCESS_KEY_ID,
    secretAccessKey:AWS_SECRET_ACCESS_KEY,
    region:AWS_REGION
});

export default AWS;

