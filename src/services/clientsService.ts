import AWS from 'aws-sdk';
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../config';

// Initialize AWS services
AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION
});

// Export initialized AWS services
export const connectService = new AWS.Connect();
export const customerProfilesService = new AWS.CustomerProfiles();