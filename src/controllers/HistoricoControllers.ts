import {Request, Response } from "express";
import AbstractController from "./AbstractController";
import { DocumentClient } from "aws-sdk/clients/dynamodb";


//The class HistoricoController extends AbstractController, is responsible to access 
//the database and retrieve the historical data of the KPIs.
class HistoricoController extends AbstractController{

    private static _instance: HistoricoController;
    //Metodo de la clase 
    public static get instance(): AbstractController{
        if(!this._instance){
            this._instance = new HistoricoController("historico");
        }
        return this._instance;
    }
    //All the routes of the controller are defined in the initRoutes method.
    protected initRoutes(): void {

        //The route /testagent is used to test the connection with the server.
        this.router.get('/testagent', this.getTestAgent.bind(this) /*callback*/);

        //Gets the KPIs historical data from the specified start date
        //Abandonment query by date range
        this.router.get('/consultaAbandono', this.consultaAbandono.bind(this));

        //Service level query by date range
        this.router.get('/consultaServicio', this.consultaServicio.bind(this));

        //Occupancy query by date range
        this.router.get('/consultaOcupacion', this.consultaOcupacion.bind(this)); 

        //Total time of call query by date range
        this.router.get('/consultaTiempo', this.consultaTiempo.bind(this));

        //Hold time query by date range
        this.router.get('/consultaEspera', this.consultaEspera.bind(this));
        
        //Gets the KPIs historical data according to minutes specified
        //Abandonment query by minutes given
        this.router.get('/abandonoMn', this.consultaAbandonoMn.bind(this));

        //Service level query by minutes given
        this.router.get('/servicioMn', this.consultaServicoMn.bind(this));
       
        //Occupancy query by minutes given
        this.router.get('/ocupacionMn', this.consultaOcupMn.bind(this));
       
        //Total time of call query by minutes given
        this.router.get('/tiempoMn', this.consultaTiempoMn.bind(this));
       
        //Hold time query by minutes given
        this.router.get('/esperaMn', this.consultaEsperaMn.bind(this));
       
        //Consults the KPIs historical data of the day before
        this.router.get('/consultaDia', this.consultaDia.bind(this));


    }

    //The route /testagent is used to test the connection with the server.  
    private getTestAgent(req: Request, res: Response){
        try{
            console.log("Prueba exitosa")
            res.status(200).send("<h1>Prueba exitosa </h1>");
        }catch(error: any){
            console.log(error);
            res.status(500).send('Internal server error' + error)
        }
    }

    //Consults the KPIs historical data of the day before
    private async consultaDia(req: Request,res: Response){
        try{
            
            const hoy =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(); //Adjust the time to Mexico City
            const dia = new Date (hoy).getDate() -1;
            const mes = new Date (hoy).getMonth();
            const año = new Date (hoy).getFullYear();
            const fecha = año + "-" + mes + "-" + dia;

            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Fecha >= :start AND Fecha <= :end', //Filter expression
                ExpressionAttributeValues: {
                ':start': new Date(fecha).toISOString().split('T')[0]+'T00:00:00.000Z',//Gets the start of the day
              
                ':end': new Date(fecha).toISOString().split('T')[0]+'T23:59:59.999Z',//Gets the end of the day 
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = []; //Where the data will be stored
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date 
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst); //Sends the data to the client
        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    //Abandonment query by date range given in the front end
    private async consultaAbandono(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient(); //Creates a new instance of the DocumentClient to access the database
            const query = {
                TableName: 'KPIPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end', //Filter expression
                ExpressionAttributeValues: {
                  ':tipo': 'Abandono', //Type of KPI
                  ':start': req.query.start, //It has to be before the :end and is specified in the front end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z',//Adjust the time to Mexico City  
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = []; //Where the data will be stored
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date and time
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    //Service level query by date range given in the front end
    private async consultaServicio(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient(); //Creates a new instance of the DocumentClient to access the database
            const query = {
                TableName: 'KPIPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end', //Filter expression to get the data specified in the front end
                ExpressionAttributeValues: {
                  ':tipo': 'Servicio', //Type of KPI
                  ':start': req.query.start, //Date specified in the front end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z', //Adjust the time to Mexico City  
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = []; //Where the data will be stored
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date and time
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    //Occupancy query by date range given in the front end
    private async consultaOcupacion(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Ocupacion', //Type of KPI
                  ':start': req.query.start, //Date specified in the front end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z', //Adjust the time to Mexico City  
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = []; //Where the data will be stored
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });
            res.status(200).send(metricaLst);

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    //Total time of call query by date range given in the front end
    private async consultaTiempo(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient(); //Creates a new instance of the DocumentClient to access the database
            const query = {
                TableName: 'KPIPrueba-DEV',
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end', //Filter expression to get the data specified in the front end
                ExpressionAttributeValues: {
                  ':tipo': 'Tiempo', //Type of KPI   
                  ':start': req.query.start, //Date specified in the front end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z',   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = []; //Where the data will be stored
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);
        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    //Hold time query by date range given in the front end
    private async consultaEspera(req: Request,res: Response){
        try{
    
            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Espera', //Type of KPI
                  ':start': req.query.start, //Date specified in the front end
                  ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0]+'T23:59:59.999Z',   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst);

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    //Abandonmente rate query by minutes specified in the front end
    private async consultaAbandonoMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad; //Gets the minutes specified in the front end

            const minC = parseInt(min) + 4; //Adds 4 minutes to the specified minutes to adjust the time

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            //Gives the appropriate date and time to the specificDate variable
            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');


            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Abandono', //Type of KPI
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Specifies how many minutes before the specificDate
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),//Specific date
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database

            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date and time
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });

            res.status(200).send(metricaLst); //Sends the data to the client

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    //Service level query by minutes specified in the front end
    private async consultaServicoMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad; //Gets the minutes specified in the front end
 
            const minC = parseInt(min) + 4; //Adds 4 minutes to the specified minutes to adjust the time

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            //Gives the appropriate date and time to the specificDate variable
            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');
            // const inicio =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

    
            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Servicio', //Type of KPI
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Specifies how many minutes before the specificDate
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = [];
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date and time
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

    //Occupancy query by minutes specified in the front end
    private async consultaOcupMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad; //Gets the minutes specified in the front end

            const minC = parseInt(min) + 4; //Adds 4 minutes to the specified minutes to adjust the time

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            //Give the correct format to the date and time to the specificDate variable for it to be a valid date
            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');
            // const inicio =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Ocupacion', //Type of KPI
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Specifies how many minutes before the specificDate
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = []; //Where the data will be stored
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        // const fecha = (kpi as any).Fecha.split('T')[0];
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date and time
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });
            res.status(200).send(metricaLst);

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    //Total time of call query by minutes specified in the front end
    private async consultaTiempoMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad; //Gets the minutes specified in the front end

            const minC = parseInt(min) + 4; //Adds 4 minutes to the specified minutes to adjust the time

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            //Give the correct format to the date and time to the specificDate variable for it to be a valid date
            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');
            // const inicio =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Tiempo', //Type of KPI
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Specifies how many minutes before the specificDate
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = []; //Where the data will be stored
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date and time
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });
            res.status(200).send(metricaLst);

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    //Hold time query by minutes specified in the front end
    private async consultaEsperaMn(req: Request,res: Response){
        try{

            const min:any = req.query.cantidad; //Gets the minutes specified in the front end

            const minC = parseInt(min) + 4; //Adds 4 minutes to the specified minutes to adjust the time

            const hora = new Date().getHours();
            const minuto = new Date().getMinutes();

            //Give the correct format to the date and time to the specificDate variable for it to be a valid date
            const specificDate = new Date('2024-06-18T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') +':00.000Z');
            // const inicio =  new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

            const docClient = new DocumentClient();
            const query = {
                TableName: 'KPIMinPrueba-DEV', //Table name in DynamoDB
                FilterExpression: 'Tipo = :tipo AND Fecha >= :start AND Fecha <= :end',
                ExpressionAttributeValues: {
                  ':tipo': 'Espera', //Type of KPI
                  ':start': new Date(specificDate.getTime() - minC * 60 * 1000).toISOString(), //Specifies how many minutes before the specificDate
                //   ':start': new Date(inicio.getTime() - minC * 60 * 1000).toISOString(), //Tiene que ser antes de del :end
                  ':end': specificDate.toISOString(),
                //   ':end': new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(),//Hora ajustada   
                },
                ScanIndexForward: true, 
              };
          
            const metricas = await docClient.scan(query).promise(); //Response of the query to the database
            const metricaLst: any = []; //Where the data will be stored
    
            if (metricas.Items) {
                for (const kpi of metricas.Items) { //Goes through the data and stores it in the metricaLst array, adding the metric, type and date
                    if (kpi) {
                        const metric = (kpi as any).Metrica;
                        const tipo = (kpi as any).Tipo; 
                        const fecha = (kpi as any).Fecha;
                        metricaLst.push([metric, tipo, fecha]);
                    }
                }
            }

            const enOrden = metricaLst.sort((a: any, b:any) => { //Sorts the data by date and time
                const dateA = new Date(a[2]); 
                const dateB = new Date(b[2]);
            
                return dateA.getTime() - dateB.getTime();
            });
            res.status(200).send(metricaLst);

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

}

export default HistoricoController;