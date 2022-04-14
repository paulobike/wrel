var password = document.getElementById("password")
, confirm_password = document.getElementById("confirm_password")
, old_password = document.getElementById('old_password');

function validatePassword(){
  if(password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity('');
  }
}
if(password) password.onchange = validatePassword;
if(confirm_password) confirm_password.onkeyup = validatePassword;