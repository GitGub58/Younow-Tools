import {settings} from "./younow"
import {log,error} from "./module_utils"
import {FakeDB,openDB,isUsernameInDB,convertToUserDB} from "./module_db"
import * as younow from "./module_younow"
import * as _async from "async"

export function cmdAdd(users:string[])
{
	openDB()
	.then((db:DB)=>
	{
		_async.eachSeries(users,function(user,callback)
		{
			user=younow.extractUser(user)

			let userdb=isUsernameInDB(db,user)

			if (userdb)
			{
				log(`${userdb.profile} is already in the db`)
				callback()
			}
			else
			{
				younow.resolveUser(db,user)
				.then(function(infos:Younow.UserInfo)
				{
					if (infos.errorCode)
					{
						error(`${user} ${infos.errorCode} ${infos.errorMsg}`)
						callback()
					}
					else
					{
						db[infos.userId]=convertToUserDB(infos.userId,infos)

						log(`${infos.profile} added to the db`)
						callback()
					}
				})
				.catch(err=>
				{
					error(err)
					callback()
				})
			}
		})
	})
	.catch(error)
}
