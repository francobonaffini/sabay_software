import bcrypt from 'bcrypt'
import { prisma } from '../src/shared/infrastructure/db/prismaClient.js'


const main = async () => {


    console.log('Iniciando semilla...')
    const existingAdmin = await prisma.user.findFirst({
        where:{
            role:'ADMIN'
        }
    })


    if(existingAdmin){
        console.log('Admin ya existe')
        return
    }


    const passwordHash = await bcrypt.hash(
        'Admin1234',
        10
    )


    const admin = await prisma.user.create({
        data:{
            email:'admin@pilates.com',
            passwordHash,
            role:'ADMIN',
            status:'ACTIVE',
            firstName:'Administrador',
            lastName:'Sistema',
        }
    })


    console.log('Admin creado:', admin.email)

}


main()
.then(()=>process.exit(0))
.catch(err=>{
    console.error(err)
    process.exit(1)
})