import {Request, Response } from "express";
import AbstractController from "./AbstractController";
import { DocumentClient } from "aws-sdk/clients/dynamodb";


class HistoricoController extends AbstractController{
    //Singleton 
    //Atributo de clase
    private static _instance: HistoricoController;
    //Metodo de la clase 
    public static get instance(): AbstractController{
        if(!this._instance){
            this._instance = new HistoricoController("historico");
        }
        return this._instance;
    }
    //Declarar todas las rutas del controlador
    protected initRoutes(): void {
        this.router.get('/testagent', this.getTestAgent.bind(this) /*callback*/);

        //Informacion de KPIS historicos a partir de fecha de inciio especificada
        //Consulta de abandono
        this.router.get('/consultaAbandono', this.consultaAbandono.bind(this));

        //Consulta de servicio
        this.router.get('/consultaServicio', this.consultaServicio.bind(this));

        //Consulta de ocupacion
        this.router.get('/consultaOcupacion', this.consultaOcupacion.bind(this)); 

        //Consulta de tiempo de llamada
        this.router.get('/consultaTiempo', this.consultaTiempo.bind(this));

        //Consulta de tiempo de espera
        this.router.get('/consultaEspera', this.consultaEspera.bind(this));
        
        //Consulta en base a minutos y horas en la base de datos de cada KPI
        //Consulta de abandono por minutos
        this.router.get('/abandonoMn', this.consultaAbandonoMn.bind(this));

        //Consulta de servicio por minutos
        this.router.get('/servicioMn', this.consultaServicoMn.bind(this));
       
        //Consulta de ocupacion por minutos
        this.router.get('/ocupacionMn', this.consultaOcupMn.bind(this));
       
        //Consulta de tiempo por minutos
        this.router.get('/tiempoMn', this.consultaTiempoMn.bind(this));
       
        //Consulta de espera por minutos
        this.router.get('/esperaMn', this.consultaEsperaMn.bind(this));
       
        //Consulta de KPIs del dia anterior
        this.router.get('/consultaDia', this.consultaDia.bind(this));


    }

      
    private getTestAgent(req: Request, res: Response){
        try{
            console.log("Prueba exitosa")
            res.status(200).send("<h1>Prueba exitosa </h1>");
        }catch(error: any){
            console.log(error);
            res.status(500).send('Internal server error' + error)
        }
    }

    private async consultaDia(req: Request,res: Response){
        try{
            
            const hoy =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString();
            const dia = new Date (hoy).getDate() -1;
            const mes = new Date (hoy).getMonth();
            const año = new Date (hoy).getFullYear();
            const fecha = año + "-" + mes + "-" + dia;

            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIPrueba-DEV',
                FilterExpression: 'Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                ':start': new Date(fecha).toISOString().split('T')[0]+'T00:00:00.000Z',//Hora ajustada   
              
                ':end': new Date(fecha).toISOString().split('T')[0]+'T23:59:59.999Z',//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica abandono enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaAbandono(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Abandono',
                  ':start': req.query.start, //Tiene que ser antes de del :end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z',//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica abandono enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaServicio(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Servicio',
                  ':start': req.query.start, //Tiene que ser antes de del :end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z',   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica servicio enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaOcupacion(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Ocupacion',
                  ':start': req.query.start, //Tiene que ser antes de del :end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z',   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica ocupacion enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaTiempo(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Tiempo',
                  ':start': req.query.start, //Tiene que ser antes de del :end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z',   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica tiempo enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaEspera(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Espera',
                  ':start': req.query.start, //Tiene que ser antes de del :end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z',   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica espera enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaAbandonoMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad;

            const minC = parseInt(min) + 4;

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');


            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Abandono',
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),//Hora ajustada
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();

            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        // const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica abandono enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaServicoMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad;

            const minC = parseInt(min) + 4;

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');

            // const inicio =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

    
            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Servicio',
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),//Hora ajustada
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        // const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica servicio por minutos enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaOcupMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad;

            const minC = parseInt(min) + 4;

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');

            // const inicio =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Ocupacion',
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),//Hora ajustada
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        // const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica ocupacion por minutos enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaTiempoMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad;

            const minC = parseInt(min) + 4;

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');

            // const inicio =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Tiempo',
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),//Hora ajustada
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        // const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica tiempo por minutos enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async consultaEsperaMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad;

            const minC = parseInt(min) + 4;

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');

            // const inicio =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Espera',
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),//Hora ajustada
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise();
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) {
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        // const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => {
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
            console.log('Metrica espera por minutos enviada');

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

}

export default HistoricoController;