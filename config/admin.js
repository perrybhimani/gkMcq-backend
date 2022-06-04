import user from '../server/models/user.model';

async function createAdmin(name, email, password) {
  try {
    let findUser = await user.findOne({ email });

    if(!findUser) {
      await user.create({
        name,
        email,
        password,
        role: 'admin'
      })
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = { 
  createAdmin 
}