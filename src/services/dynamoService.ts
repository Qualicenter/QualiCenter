/**
 * @author Aldehil Sánchez
 * This file contains the configuration for the dynamodb service
 */

import dynamodb from 'dynamodb';
import {AWS_REGION,AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY} from '../config';

dynamodb.AWS.config.update({
    accessKeyId:AWS_ACCESS_KEY_ID,
    secretAccessKey:AWS_SECRET_ACCESS_KEY,
    region:AWS_REGION
});

export default dynamodb;