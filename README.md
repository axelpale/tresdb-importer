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
      locator: {
        db_admin_name: 'foo',
        db_admin_password: 'bar',
        db_url: 'http://localhost:3306'
      },

      tresdb: {
        db_admin_name: 'baz',
        db_admin_password: 'biz',
        db_url: 'http://localhost:27017'
      }
    };


## Usage

Export data from Xitrux Locator to JSON, stored under `data/`:

    $ node export.js

Import JSON under `data/` to TresDB's MongoDB:

    $ node import.js


## Technologies

- [node-mysql](https://github.com/mysqljs/mysql)
- [jsonfile](https://www.npmjs.com/package/jsonfile)

## License

MIT
