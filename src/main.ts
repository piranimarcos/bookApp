import { startServer } from './server';
import { conect } from './config/typeorm'

import { enviroment } from './config/enviroment';


async function main() {
    conect();
    const port: number = Number(enviroment.PORT);
    const app = await startServer();

    app.listen(port, () => console.log(`App running in port ${port}`));
}

main();