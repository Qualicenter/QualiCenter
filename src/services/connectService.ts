import * as AWS from 'aws-sdk';
import { AWS_REGION, AWS_ACCESS_KEY_ID_LENS, AWS_SECRET_ACCESS_KEY_LENS  } from '../config';

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID_LENS,
  secretAccessKey: AWS_SECRET_ACCESS_KEY_LENS,
  region: AWS_REGION
});

// Instanciar Amazon Connect
const connect = new AWS.ConnectContactLens();

export default connect;