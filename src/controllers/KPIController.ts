import {Request, Response } from "express";
import AbstractController from "./AbstractController";
import connect from "../services/connectService";
import KPIPruebaModel from "../modelsNoSQL/KPIHist";
import KPIMinPruebaModel from "../modelsNoSQL/KPIMin";


class KPIsController extends AbstractController{
    //Singleton 
    //Atributo de clase
    private static _instance: KPIsController;
    //Metodo de la clase 
    public static get instance(): AbstractController{
        if(!this._instance){
            this._instance = new KPIsController("kpis");
        }
        return this._instance;
    }
    //Declarar todas las rutas del controlador
    protected initRoutes(): void {

        //Información de KPIs por cada 5 minutos
        this.router.get('/cincoMin', this.cincoMin.bind(this));

        //Información de KPIs por cada día
        this.router.get('/dia', this.dia.bind(this));


        //Guardar información de KPIs por dia, en KPIrueba
        this.router.post('/multiplesKPIS', this.multiplesKPIS.bind(this));

        //Guardar información de KPIs segun el front end, por cada minuto en la base de datos de KPIMin 
        this.router.post('/crearMinKPI',this.postCrearMinKPI.bind(this));

    }

    private async cincoMin(req: Request, res: Response) {
        try {
            const info = {
                ResourceArn: 'arn:aws:connect:us-east-1:744102162455:instance/e730139b-8673-445e-8307-c3a9250199a2', 
                //QUINCE MINUTOS
                StartTime: new Date(new Date().getTime() - 5 * 60 * 1000), 
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

            const data = await connect.getMetricDataV2(info).promise();
            const disponible = await connect.getCurrentMetricData(disp).promise();
            const ocupacion = await connect.getCurrentMetricData(oc).promise();
            // res.status(200).json(data);
            const metricLst: any = [];

            let inicio:any = new Date(new Date().getTime() - 5 * 60 * 1000);
            let fin:any = new Date();
            // let inicio:any = new Date();
            // let fin:any = new Date();


    if (data.MetricResults && data.MetricResults.length > 0) {
        for (const metricResult of data.MetricResults) {
            console.log("si hay datos");
            //   if (metricResult.MetricInterval) {
                //   inicio = metricResult.MetricInterval.StartTime;
                inicio = new Date(inicio.getTime() - 6 * 60 * 60 * 1000);
                //   fin = metricResult.MetricInterval.EndTime;
                fin = new Date(fin.getTime() - 6 * 60 * 60 * 1000);
                metricLst.push([inicio, fin]);
                // }

            if (metricResult.Collections && metricResult.Collections.length > 0) {
            for (const collection of metricResult.Collections) {
                metricLst.push([collection.Metric?.Name,collection.Value]);
            }
            }

        }
        }else {
            console.log("No hay datos");
        }
        let dispValue:any;
        if (disponible.MetricResults && disponible.MetricResults.length > 0) {
            for (const metricResult of disponible.MetricResults) {
                if (metricResult.Collections && metricResult.Collections.length > 0) {
                    for (const collection of metricResult.Collections) {
                        dispValue = collection.Value;
                    }
                }
            }
        }
        let ocValue:any;
        if (ocupacion.MetricResults && ocupacion.MetricResults.length > 0) {
            for (const metricResult of ocupacion.MetricResults) {
                if (metricResult.Collections && metricResult.Collections.length > 0) {
                    for (const collection of metricResult.Collections) {
                        ocValue = collection.Value;
                    }
                }
            }
        }
        console.log(dispValue);
        console.log(ocValue);
        const ocupacionValue = ocValue * 100 / dispValue;
        metricLst.push(["Ocupacion", ocupacionValue]);

        // res.status(200).json(data);
        res.status(200).json(metricLst);


        console.log("Prueba exitosa cinco minutos")

        } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error' + err);
    }
    }

    private async dia(req: Request, res: Response) {
        try {
            const info = {
                ResourceArn: 'arn:aws:connect:us-east-1:744102162455:instance/e730139b-8673-445e-8307-c3a9250199a2', 
                //QUINCE MINUTOS
                StartTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 
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


            const data = await connect.getMetricDataV2(info).promise();
            // res.status(200).json(data);
            const metricLst: any = [];

            let inicio:any = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);


    if (data.MetricResults && data.MetricResults.length > 0) {
        for (const metricResult of data.MetricResults) {
            console.log("si hay datos");
                inicio = new Date(inicio.getTime() - 6 * 60 * 60 * 1000);
                metricLst.push([inicio]);


            if (metricResult.Collections && metricResult.Collections.length > 0) {
            for (const collection of metricResult.Collections) {
                metricLst.push([collection.Metric?.Name,collection.Value]);
            }
            }

        }
        }else {
            console.log("No hay datos");
        }

        // res.status(200).json(data);
        res.status(200).json(metricLst);


        console.log("Prueba exitosa cinco minutos")

        } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error' + err);
    }
    }

    private async multiplesKPIS(req: Request, res: Response) {
        try {
          const kpiList: any[] = await req.body; 

          for (const kpi of kpiList) {
            await KPIPruebaModel.create(kpi);
        }

          console.log("KPIs MIN creados");
          res.status(201).send("<h1>KPIs creados</h1>"); 
        } catch (err) {
          console.error(err);
          res.status(500).send('Internal server error'); // Improved error message
        }
    }

    private async postCrearMinKPI(req: Request, res: Response) {
        try {
          const kpiList: any[] = await req.body; 

          for (const kpi of kpiList) {
            await KPIMinPruebaModel.create(kpi);
          }

          console.log("KPIs creados minutos");
          res.status(201).send("<h1>KPIs creados</h1>"); 
        } catch (err) {
          console.error(err);
          res.status(500).send('Internal server error'); // Improved error message
        }
    }
}

export default KPIsController;