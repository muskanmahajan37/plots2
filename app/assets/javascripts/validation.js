$(document).ready(function() {
  $("#edit-form").validate({
    rules: {
      email: {
        required: true,
        email: true
      },
      password1: {
        required: true,
        minlength: 8
      },
      password2: {
        equalTo: "#password1"
      }
    },
    messages: {
      password1: {
        required: "Please enter password",
        minlength: "Password should be minimum 8 characters long"
      },
      email: {
        required: "Please enter email",
        email: "Invalid email address"
      },
      password2: {
        required: "Please enter password",
        minlength: "Password should be minimum 8 characters long",
        equalTo: "Passwords doesn't match"
      }
    },
    submitHandler: function(form) {
      form.submit();
    }
  });
});

$(document).ready(function () {
  // The two forms have same ID
  var forms = document.querySelectorAll("#create-form");

  // Sign up modal form
  forms[0].classList.add("signup-modal-form");
  var signUpModalForm = new SignUpFormValidator(".signup-modal-form");

  // publiclab.org/register form
  if (forms[1]) {
    forms[1].classList.add("signup-register-form");
    var signUpRegisterForm = new SignUpFormValidator(".signup-register-form");
  }
});

// Form validation class
function SignUpFormValidator(formClass) {
  var signUpForm = document.querySelector(formClass);

  if (!signUpForm) return;

  this.validationTracker = {};
  this.submitBtn = document.querySelector(formClass + ' [type="submit"');

  this.isFormValid();

  var usernameElement = document.querySelector(
    formClass + " [name='user[username]']"
  );
  var emailElement = document.querySelector(
    formClass + " [name='user[email]']"
  );
  var passwordElement = document.querySelector(
    formClass + " [name='user[password]']"
  );
  var confirmPasswordElement = document.querySelector(
    formClass + " [name='user[password_confirmation]']"
  );

  // Every time user types something, corresponding event listener are triggered
  usernameElement.addEventListener(
    "input",
    validateUsername.bind(usernameElement, this)
  );
  emailElement.addEventListener(
    "input",
    validateEmail.bind(emailElement, this)
  );
  passwordElement.addEventListener(
    "input",
    validatePassword.bind(passwordElement, confirmPasswordElement, this)
  );
  confirmPasswordElement.addEventListener(
    "input",
    validateConfirmPassword.bind(confirmPasswordElement, passwordElement, this)
  );
}

// Typing the form triggers the function
// Updates UI depending on the value of <valid> parameter
SignUpFormValidator.prototype.updateUI = function(element, valid, errorMsg) {
  var elementName = element.getAttribute("name");

  if (valid) {
    this.validationTracker[elementName] = true;
    styleElement(element, "form-element-invalid", "form-element-valid");
    removeErrorMsg(element);
  } else {
    this.validationTracker[elementName] = false;
    styleElement(element, "form-element-valid", "form-element-invalid");
    renderErrorMsg(element, errorMsg);
  }

  this.isFormValid();
};

SignUpFormValidator.prototype.disableSubmitBtn = function() {
  this.submitBtn.setAttribute("disabled", "");
};

SignUpFormValidator.prototype.enableSubmitBtn = function() {
  this.submitBtn.removeAttribute("disabled");
};

SignUpFormValidator.prototype.isFormValid = function() {
  // Form is valid if all elements have passsed validation successfully
  var isValidForm =
    Object.values(this.validationTracker).filter(Boolean).length === 4;

  if (isValidForm) this.enableSubmitBtn();
  else this.disableSubmitBtn();
};

function validateUsername(obj) {
  var username = this.value;
  var self = this;

  if (username.length < 3) {
    restoreOriginalStyle(this);
    obj.disableSubmitBtn();
    removeErrorMsg(self);
  } else {
    $.get("/api/srch/profiles?query=" + username, function(data) {
      if (data.items) {
        $.map(data.items, function(userData) {
          if (userData.doc_title === username) {
            obj.updateUI(self, false, "Username already exists");
          } else {
            obj.updateUI(self, true);
          }
        });
      } else {
        obj.updateUI(self, true);
      }
    });
  }
}

function validateEmail(obj) {
  var email = this.value;
  var emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var isValidEmail = emailRegExp.test(email);

  obj.updateUI(this, isValidEmail, "Invalid email");
}

function validatePassword(confirmPasswordElement, obj) {
  var password = this.value;

  if (!isPasswordValid(password)) {
    obj.updateUI(
      this,
      false,
      "Please make sure password is at least 8 characters long with minimum one numeric value"
    );
    return;
  }

  if (password === confirmPasswordElement.value) {
    obj.updateUI(confirmPasswordElement, true);
  }

  obj.updateUI(this, true);
}

function validateConfirmPassword(passwordElement, obj) {
  var confirmPassword = this.value;
  var password = passwordElement.value;

  if (confirmPassword !== password) {
    obj.updateUI(this, false, "Passwords must be equal");
    return;
  }

  obj.updateUI(this, true);
}

// Password is valid if it is at least 8 characaters long and contains a number
// Password's validation logic, no UI updates
function isPasswordValid(password) {
  var doesContainNumber = /\d+/g.test(password);
  var isValidPassword = password.length >= 8 && doesContainNumber;

  return isValidPassword;
}

function renderErrorMsg(element, message) {
  if (!message) return;

  // Error messages are rendered inside of a <small> HTML element
  var errorMsgElement = element.nextElementSibling;
  if (!errorMsgElement) {
    // On publiclab.org/register invalid elements are wrapped in a div.
    errorMsgElement = element.parentElement.nextElementSibling;
  }

  errorMsgElement.textContent = message;
  errorMsgElement.style.color = "red";
  errorMsgElement.classList.remove("invisible");
}

function removeErrorMsg(element) {
  var errorMsgElement = element.nextElementSibling;
  if (!errorMsgElement) {
    errorMsgElement = element.parentElement.nextElementSibling;
  }

  errorMsgElement.classList.add("invisible");
}

function restoreOriginalStyle(element) {
  element.classList.remove("form-element-valid");
  element.classList.remove("form-element-invalid");
}

// Makes input element red or green
function styleElement(element, classToRemove, classToAdd) {
  if (element.classList.contains(classToRemove)) {
    element.classList.remove(classToRemove);
  }

  element.classList.add(classToAdd);
}
