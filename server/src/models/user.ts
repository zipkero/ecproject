import db from "../db";

export interface UserKey {
  Owner: string;
  Password?: string;
}

export interface User extends UserKey {
  MainRole?: number;
  CurrentJobCode?: string;
  CurrentJobRequestDate?: Date;
  CurrentJobCategory?: number;
  PreviousJobCode?: string;
}

const UserModel = {
  addUser: async (user: UserKey): Promise<number> => {
    return await db.execute({
      query: `
      insert into User
      (Owner, Password)
      values 
      (?, ?);
      `,
      params: [user.Owner, user.Password],
    });
  },
  getUser: async (user: UserKey): Promise<User | null> => {
    try {
      return await db.query<User>({
        query: `
        select * from User
        where Owner = ? and Password = ?      
        `,
        params: [user.Owner, user.Password],
      });
    } catch (e) {
      return null;
    }
  },
  getUsers: async (): Promise<User[] | null> => {
    try {
      return await db.queryAll<User>({
        query: `
        select * from User
        `,
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  },
};

export default UserModel;
