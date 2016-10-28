# tresdb-importer

Import data from Xitrux Locator to TresDB.


## Install

Clone the repository:

    $ git clone https://github.com/axelpale/tresdb-importer.git
    $ cd tresdb-importer

Install dependencies:

    $ npm install

Create `config/local.js` similar to:

    module.exports = {
      locator_db: {
        host: 'localhost',
        port: 3306,
        user: 'foo',
        password: 'bar',
        database: 'baz'
      },
      tresdb_db: {
        host: 'localhost',
        port: 27017,
        user: 'foo',
        password: 'bar',
        database: 'baz'
      }
    };


## Usage

Export data from Xitrux Locator to JSON, stored under `data/`:

    $ node export.js

Import JSON under `data/` to TresDB's MongoDB:

    $ node import.js


## Tips

To export from and import to a remote database, an SSH tunnel can be helpful. Due to security reasons, often databases are accessible only locally, making direct remote access impossible. By opening a tunnel between local and remote machine, this restriction can be bypassed. The following opens a tunnel between a local port 1337 and the local port 3306 of the remote server:

    $ ssh -L 1337:localhost:3306 username@remote.com

Once the tunnel is open, the remote database can be accessed on localhost:1337.

## Importing user uploads

First export uploaded files from the Locator instance. Fetching uploaded files is easily done with scp. For example if you host Locator on Webfaction's platform, you could do:

    $ scp -r myname.webfactional.com:~/webapps/locator/uploads ./data

As a result, the uploaded files are now available in `/data/uploads`.

Then run a transform script `uploads.js`. The script reads `data/dump.json` and `data/uploads/uploadlog.txt` and creates a TresDB compatible upload directory `/data/tresdb-uploads` with the files in it.

    $ node uploads.js

Finally, send the `tresdb-uploads` dir to your TresDB server with scp:

    $ scp -r ./data/tresdb-uploads/* example.com:/path/to/tresdb/.data/uploads

## Technologies

- [node-mysql](https://github.com/mysqljs/mysql)
- [node-mongodb-native](https://github.com/mongodb/node-mongodb-native)
- [jsonfile](https://www.npmjs.com/package/jsonfile)

## License

MIT
