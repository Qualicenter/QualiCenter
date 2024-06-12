import {Request, Response } from "express";
import AbstractController from "./AbstractController";
import connect from "../services/connectService";
import KPIPruebaModel from "../modelsNoSQL/KPIHist";
import KPIMinPruebaModel from "../modelsNoSQL/KPIMin";


class KPIsController extends AbstractController{
    //Attributes of the class
    private static _instance: KPIsController;
    //Methods 
    public static get instance(): AbstractController{
        if(!this._instance){
            this._instance = new KPIsController("kpis");
        }
        return this._instance;
    }
    //All the routes of the class
    protected initRoutes(): void {

        //The route for the KPIs of the last five minutes
        this.router.get('/cincoMin', this.cincoMin.bind(this));

        //The route for the KPIs of the last 24 hours
        this.router.get('/dia', this.dia.bind(this));


        //Save KPIs information according to the front end in the KPIPrueba each day
        this.router.post('/multiplesKPIS', this.multiplesKPIS.bind(this));

        //Save KPIs information according to the front end in the KPIMinPrueba
        this.router.post('/crearMinKPI',this.postCrearMinKPI.bind(this));

    }

    //The route for the KPIs of the last five minutes
    private async cincoMin(req: Request, res: Response) {
        try {
            const info = {
                ResourceArn: 'arn:aws:connect:us-east-1:744102162455:instance/e730139b-8673-445e-8307-c3a9250199a2', 
                StartTime: new Date(new Date().getTime() - 5 * 60 * 1000), //5 minutes ago
                EndTime: new Date() ,
                Filters: [
                    {
                        'FilterKey': 'QUEUE',
                        'FilterValues': [
                            'f6512e90-b9c0-413b-beb9-702a5473435a',
                        ]
                    },
                ],
                Groupings: [
                    'QUEUE',
                ],
                Metrics: [
                    {
                        'Name': 'ABANDONMENT_RATE', //Metric name, returns the percentage of contacts that were abandoned by customers before being handled by an agent
                    },
                    {
                        'Name': 'AVG_CONTACT_DURATION',//Metric name, returns the average time that the contact was active
                    },
                    {
                        'Name': 'AVG_HOLD_TIME' //Metric name, returns the average time that the contact was on hold before being handled by an agent
                    },
                    {
                        'Name': 'SERVICE_LEVEL',//Metric name, it has a threshold
                        'Threshold': [
                            {
                                'Comparison': 'LT',
                                'ThresholdValue': 20
                            },
                        ],
                    },
                ],
            };

            //Gets the total number of agents available
            const disp = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                Filters: {
                    Channels: ['VOICE'],
                    Queues: ['f6512e90-b9c0-413b-beb9-702a5473435a'],
                },
                CurrentMetrics: [
                    {
                        Name: 'AGENTS_AVAILABLE',
                        Unit: 'COUNT',
                    },
                ],
            };

            //Gets the total number of agents on call
            const oc = {
                InstanceId: 'e730139b-8673-445e-8307-c3a9250199a2',
                Filters: {
                    Channels: ['VOICE'],
                    Queues: ['f6512e90-b9c0-413b-beb9-702a5473435a'],
                },
                CurrentMetrics: [
                    {
                        Name: 'AGENTS_ON_CALL',
                        Unit: 'COUNT',
                    },

                ],
            };

            //The variables store the data of the metrics from Amazon Connect
            const data = await connect.getMetricDataV2(info).promise();
            const disponible = await connect.getCurrentMetricData(disp).promise();
            const ocupacion = await connect.getCurrentMetricData(oc).promise();

            //The variable stores the data of the metrics
            const metricLst: any = [];

            //The times stamps of the metrics when returning the data
            let inicio:any = new Date(new Date().getTime() - 5 * 60 * 1000);
            let fin:any = new Date();
  


    if (data.MetricResults && data.MetricResults.length > 0) { //Checks if there is data
        for (const metricResult of data.MetricResults) {
                inicio = new Date(inicio.getTime() - 6 * 60 * 60 * 1000); //Adjust the time to the local time, Mexico City
                fin = new Date(fin.getTime() - 6 * 60 * 60 * 1000); //Adjust the time to the local time, Mexico City
                metricLst.push([inicio, fin]); //Stores the time stamps of the metrics

            if (metricResult.Collections && metricResult.Collections.length > 0) {
            for (const collection of metricResult.Collections) {
                metricLst.push([collection.Metric?.Name,collection.Value]); //Stores the name and value of each of the metrics
            }
            }

        }
        }else {
            console.log("No hay datos");
        }
        let dispValue:any;
        if (disponible.MetricResults && disponible.MetricResults.length > 0) { //Checks if there is data
            for (const metricResult of disponible.MetricResults) {
                if (metricResult.Collections && metricResult.Collections.length > 0) {
                    for (const collection of metricResult.Collections) { //Accesses the data of the metric
                        dispValue = collection.Value; //Stores the value of the metric
                    }
                }
            }
        }
        let ocValue:any;
        if (ocupacion.MetricResults && ocupacion.MetricResults.length > 0) {//Checks if there is data
            for (const metricResult of ocupacion.MetricResults) {
                if (metricResult.Collections && metricResult.Collections.length > 0) {
                    for (const collection of metricResult.Collections) {//Accesses the data of the metric
                        ocValue = collection.Value;//Stores the value of the metric
                    }
                }
            }
        }
        //Calculates the percentage of occupation of the agents
        const ocupacionValue = ocValue * 100 / dispValue;
        metricLst.push(["Ocupacion", ocupacionValue]);//Stores the value of the occupation of the agents

        res.status(200).json(metricLst); //Returns the data of the metrics

        } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error' + err);
    }
    }

    //The route for the KPIs of the last day
    private async dia(req: Request, res: Response) {
        try {
            const info = {
                ResourceArn: 'arn:aws:connect:us-east-1:744102162455:instance/e730139b-8673-445e-8307-c3a9250199a2', 
                //QUINCE MINUTOS
                StartTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),  //Gets the data of the last day
                EndTime: new Date() ,
                Filters: [
                    {
                        'FilterKey': 'QUEUE',
                        'FilterValues': [
                            'f6512e90-b9c0-413b-beb9-702a5473435a',
                        ]
                    },
                ],
                Groupings: [
                    'QUEUE',
                ],
                Metrics: [
                    {
                        'Name': 'ABANDONMENT_RATE',
                    },
                    {
                        'Name': 'AVG_CONTACT_DURATION',
                    },
                    {
                        'Name': 'AVG_HOLD_TIME'
                    },
                    {
                        'Name': 'SERVICE_LEVEL',
                        'Threshold': [
                            {
                                'Comparison': 'LT',
                                'ThresholdValue': 20
                            },
                        ],
                    },
                ],
            };
            const data = await connect.getMetricDataV2(info).promise(); //Gets the data of the metrics
            const metricLst: any = [];//Stores the data of the metrics

            let inicio:any = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);


    if (data.MetricResults && data.MetricResults.length > 0) {
        for (const metricResult of data.MetricResults) {
            console.log("si hay datos");
                inicio = new Date(inicio.getTime() - 6 * 60 * 60 * 1000);//Adjust the time to the local time, Mexico City
                metricLst.push([inicio]);


            if (metricResult.Collections && metricResult.Collections.length > 0) { //Checks if there is data
            for (const collection of metricResult.Collections) { //Accesses the data of the metric
                metricLst.push([collection.Metric?.Name,collection.Value]);
            }
            }

        }
        }else {
            console.log("No hay datos");
        }

        res.status(200).json(metricLst);


        } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error' + err);
    }
    }

    //Save KPIs information according to the front end in the KPIPrueba each day
    private async multiplesKPIS(req: Request, res: Response) {
        try {
          const kpiList: any[] = await req.body; //Considers the request body as an array of KPIs

          for (const kpi of kpiList) {
            await KPIPruebaModel.create(kpi); //Accesses the model and creates the KPIs
        }

          res.status(201).send("<h1>KPIs creados</h1>"); 
        } catch (err) {
          console.error(err);
          res.status(500).send('Internal server error'); // Improved error message
        }
    }

    //Save KPIs information according to the front end in the KPIMinPrueba
    private async postCrearMinKPI(req: Request, res: Response) {
        try {
          const kpiList: any[] = await req.body; //Considers the request body as an array of KPIs

          for (const kpi of kpiList) {
            await KPIMinPruebaModel.create(kpi); //Accesses the model and creates the KPIs
          }

          res.status(201).send("<h1>KPIs creados</h1>"); 
        } catch (err) {
          console.error(err);
          res.status(500).send('Internal server error'); // Improved error message
        }
    }
}

export default KPIsController;