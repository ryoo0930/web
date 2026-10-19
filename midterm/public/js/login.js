'use strict';
document.querySelector('#login-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),message=document.querySelector('#message');button.disabled=true;
  try {const csrf=await fetch('/api/v1/auth/csrf').then(r=>r.json());const response=await fetch('/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf.data.csrfToken},body:JSON.stringify(Object.fromEntries(new FormData(form)))});const result=await response.json();if(!response.ok)throw new Error(result.error.message);location.href='/';}
  catch(error){message.textContent=error.message;message.className='notice error';}finally{button.disabled=false;}
});
