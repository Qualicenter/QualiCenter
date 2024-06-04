import * as AWS from 'aws-sdk';
<<<<<<< HEAD
import { AWS_REGION, AWS_ACCESS_KEY_ID_LENS, AWS_SECRET_ACCESS_KEY_LENS } from '../config';

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID_LENS,
  secretAccessKey: AWS_SECRET_ACCESS_KEY_LENS,
=======
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../config';

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
>>>>>>> 8d21025dd0ed2763d5b2c6749b8db296f2bed860
  region: AWS_REGION
});

// Instanciar Amazon Connect
const connect = new AWS.Connect();

export default connect;