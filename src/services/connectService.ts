/**
 * @author Noh Ah Kim Kwon
 * 
 * Controller in charge of managing the requests related to the agent
 */ 

import AWS from 'aws-sdk';
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../config';

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

// Instantiate Amazon Connect
const connect = new AWS.Connect();

export default connect;