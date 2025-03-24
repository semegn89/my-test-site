// auth.js
import { showToast } from './utils.js';

export function handleLoginForm(e){
  e.preventDefault();
  const login = e.target.modalEmail.value.trim();
  const password = e.target.modalPassword.value.trim();

  // Админ
  if(login==='123' && password==='123456'){
    const adminUser={email:'admin', password:'123456', role:'admin', feePercent:0};
    localStorage.setItem('isLoggedIn','true');
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    document.getElementById('loginModal').style.display='none';
    showToast('Вход как Админ!','success');
    // Можно вызывать callback, напр. onLoginSuccess();
    return;
  }

  let users=JSON.parse(localStorage.getItem('users'))||[];
  const user=users.find(u=>u.email===login && u.password===password);
  if(user){
    user.role='user';
    localStorage.setItem('isLoggedIn','true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    document.getElementById('loginModal').style.display='none';
    showToast('Добро пожаловать!','success');
    // onLoginSuccess();
  } else {
    showToast('Неверный логин или пароль!','error');
  }
}

export function handleRegisterForm(e){
  e.preventDefault();
  let users=JSON.parse(localStorage.getItem('users'))||[];
  const fd=new FormData(e.target);
  const newUser={
    email: fd.get('rEmail').trim(),
    password: fd.get('rPassword').trim(),
    companyName: fd.get('companyName'),
    inn: fd.get('inn'),
    address: fd.get('address'),
    bankName: fd.get('bankName'),
    bik: fd.get('bik'),
    accountNumber: fd.get('accountNumber'),
    feePercent:0,
    role:'user',
    agreementNo:'',
    agreementDate:''
  };
  if(users.some(u=>u.email===newUser.email)){
    showToast('Логин уже существует!','error');
    return;
  }
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  showToast('Регистрация успешна!','success');
  document.getElementById('registerModal').style.display='none';
  e.target.reset();
}