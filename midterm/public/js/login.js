'use strict';
document.querySelector('#login-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),message=document.querySelector('#message');button.disabled=true;
  try {
    const csrfResponse=await fetch('/api/v1/auth/csrf');
    const csrf=await csrfResponse.json();
    if(!csrfResponse.ok||!csrf.success||!csrf.data?.csrfToken)throw new Error(csrf.error?.message||'로그인 보안 토큰을 발급받지 못했습니다. 다시 시도하세요.');
    const response=await fetch('/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf.data.csrfToken},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
    const result=await response.json();
    if(!response.ok||!result.success)throw new Error(result.error?.message||'로그인 요청에 실패했습니다.');
    location.href='/';
  }
  catch(error){message.textContent=error.message;message.className='notice error';}finally{button.disabled=false;}
});
