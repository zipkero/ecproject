import sqlite3, { RunResult } from "sqlite3";

import path from "path";

export const database = new sqlite3.Database(
  path.resolve("data/ecproject.db"),
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.log(err);
    }
  }
);

export interface ExecuteArguments {
  query: string;
  params?: any;
}

const db = {
  execute: (args: ExecuteArguments): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
      database.run(args.query, args.params, function (err: Error) {
        if (err) {
          reject(err);
        }
        resolve(this.lastID);
      });
    });
  },
  query<T>(args: ExecuteArguments): Promise<T | null> {
    return new Promise<T>((resolve, reject) => {
      database.get(args.query, args.params, function (err: Error, row: T) {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  },
  queryAll<T>(args: ExecuteArguments): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      database.all(args.query, args.params, function (err: Error, rows: T[]) {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  },
};

export default db;
