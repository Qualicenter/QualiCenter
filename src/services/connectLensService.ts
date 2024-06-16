/**
 * @author Angel Armando Marquez Curiel
 * @author 
 * @author
 * 
 * Controller in charge of managing the requests related to the agent
 */ 

import AWS from 'aws-sdk'
import { AWS_REGION, AWS_ACCESS_KEY_ID_LENS, AWS_SECRET_ACCESS_KEY_LENS  } from '../config';

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID_LENS,
  secretAccessKey: AWS_SECRET_ACCESS_KEY_LENS,
  region: AWS_REGION
});

// Instantiate Contact Lens
const connectLens = new AWS.ConnectContactLens();

export default connectLens;