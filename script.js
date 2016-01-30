Parse.initialize("EJ3swVy8iVnXKAO6XvT2LhGhYJ4BKLjFqRiuuxyX", "U5KZUB7IOm6JTwhdicpaBGxhVRtcJh2lOpHfH519");

//parse objects
var Tutorial = Parse.Object.extend("Tutorial");

//form handles
var loginForm = $(".login");
var signupForm = $(".signup");

//divs handles
var mainPageDiv = $("#mainPageDiv");
var tagListDiv = $('#tagListDiv');

//lists handles
var mainPageTutorialsDisplayUl = $('#mainPageTutorialsDisplayUl');

//modal handles
var tutorialTitleModalP = $('#tutorialTitleModalP');
var tutorialTypeModalP = $('#tutorialTypeModalP');
var tutorialDescriptionModalP = $('#tutorialDescriptionModalP');
var tutorialLinkModalP = $('#tutorialLinkModalP');
var tutorialTagsModalDiv = $('#tutorialTagsModalDiv');

//button handles
var loginButton = $('#loginButton');
var newAccountButton = $('#newAccountButton');

var signupButton = $('#signupButton');
var backButton = $('#backButton');

var addTagButton = $('#addTagButton');
var addTutorialButton = $('#addTutorialButton');
var closeAddTutorialModalButton = $('#closeAddTutorialModalButton');
var logoutButton = $('#logoutButton');


//display functions
function displayMainPage() {
    loginForm.addClass("hidden");
    signupForm.addClass("hidden");
    mainPageDiv.removeClass("hidden");
    populateWithTutorials();
}
function displayLoginForm() {
    loginForm.removeClass("hidden");
    signupForm.addClass("hidden");
    mainPageDiv.addClass("hidden");
}
function displaySignupForm() {
    loginForm.addClass("hidden");
    signupForm.removeClass("hidden");
    mainPageDiv.addClass("hidden");
}

//populate/depopulate stuff
function populateWithTutorials() {
    var query = new Parse.Query(Tutorial);
    query.find(
        {
            success: function (tutorials) {
                for (var i = 0; i < tutorials.length; i++) {
                    mainPageTutorialsDisplayUl.append("<div class='row list-group-item' onclick = 'populateModal(this);' id='" + tutorials[i].id + "'><h3 class='col-md-12'>" + tutorials[i].get('title') + "</h3><h3 class='col-md-12'><small>" + tutorials[i].get('rating') + "(" + tutorials[i].get('votes') + " voters)</small></h3></li>");
                }
            },
            error: function (schedules, error) {

            }
        }
    );
}
function populateModal(tutorial) {

    var currentUser = Parse.User.current();
    var clicks_left = currentUser.get("clicks_left");

    if (clicks_left <= 0) {
        return;
    }

    currentUser.set("clicks_left", currentUser.get("clicks_left") - 1);
    currentUser.save(null, {
        success: function (user) {
            updateClicksLeft();
        },
        error: function (user, error) {
        }
    });

    var query = new Parse.Query(Tutorial);
    query.get($(tutorial).attr("id"),
        {
            success: function (tutorial) {
                tutorialTitleModalP.html(tutorial.get('title'));
                tutorialTypeModalP.html(tutorial.get('type'));
                tutorialDescriptionModalP.html(tutorial.get('description'));
                tutorialLinkModalP.html(tutorial.get('link'));
                var tags = tutorial.get('tags');
                for (var i = 0; i < tags.length ; i++) {
                    tutorialTagsModalDiv.append("<span class='label label-primary col-md-2'>" + tags[i] + "</span>");
                }
                $('#showTutorialModal').modal('toggle');
                $('#showTutorialModal').modal('show');
            },
            error: function (tutorial, error) {

            }
        }
    );
}
function removeTag(tag) {
    $(tag).parent().remove();
}
function updateClicksLeft() {
    var currentUser = Parse.User.current();
    $('#clicksLeftP').html(currentUser.get("clicks_left"));
}

//button functions
loginButton.click(
    function () {
        var username = $("#usernameLoginInput").val();
        var password = $("#passwordLoginInput").val();

        Parse.User.logIn(username, password, {
            success: function (user) {
                location.reload();
            },
            error: function (user, error) {
                $('#usernameLoginInputDiv').addClass('has-error');
                $('#passwordLoginInputDiv').addClass('has-error');
            }
        });
    }
);
newAccountButton.click(displaySignupForm);
signupButton.click(
    function () {
        var username = $("#usernameSignupInput").val();
        var password = $("#passwordSignupInput").val();
        var passwordConfirm = $('#passwordConfirmInput').val();
        var email = $('#emailInput').val();

        if (password.localeCompare(passwordConfirm)) {
            $('#passwordConfirmInputDiv').addClass('has-error');
        }
        else {
            var newUser = new Parse.User();

            newUser.set("username", username);
            newUser.set("password", password);
            newUser.set("email", email);
            newUser.set("tutorials_voted", []);
            newUser.set("clicks_left", 15);

            newUser.signUp(null, {
                success: function (user) {
                    location.reload();
                },
                error: function (user, error) {
                }
            });
        }

    }
);
backButton.click(function () {
    location.reload();
});
addTagButton.click(function () {
    tagListDiv.append("<span class='label label-primary col-md-2'>" + $('#addTagInput').val() + "<button type='button' class='close' onclick = 'removeTag(this);'>&times;</button></span>");
    $('#addTagInput').val('');
})
addTutorialButton.click(function () {

    var newTutorial = new Tutorial();

    newTutorial.set("type",$('#tutorialTypeSelect').val());
    newTutorial.set("title", $('#tutorialTitleInput').val());
    newTutorial.set("description", $('#tutorialDescriptionTextarea').val());
    newTutorial.set("link", $('#tutorialLinkInput').val());
    newTutorial.set("poster", Parse.User.current().get("username"));
    newTutorial.set("rating", 0);
    newTutorial.set("votes", 0);

    var tags = [];
    $('#tagListDiv').children().each(function () {
        tags.push($(this).text().slice(0,-1));
    });
    newTutorial.set("tags", tags);

    newTutorial.save(null,
        {
            success: function (tutorial) {
                mainPageTutorialsDisplayUl.append("<div class='row list-group-item' onclick = 'populateModal(this);' id='" + tutorial.id + "'><h3 class='col-md-12'>" + tutorial.get('title') + "</h3><h3 class='col-md-12'><small>" + tutorial.get('rating') + "(" + tutorial.get('votes') + " voters)</small></h3></li>");
            },
            error: function (tutorial, error) {
            }
        }
    );
});
closeAddTutorialModalButton.click(
    function () {
        $('#tutorialTitleInput').val('');
        $('#tutorialDescriptionTextarea').val('');
        $('#tutorialLinkInput').val('');
        $('#addTagInput').val('');
        $('#tagListDiv').empty();
    }
);
logoutButton.click(
    function () {
        Parse.User.logOut();
        location.reload();
    }
);

var currentUser = Parse.User.current();

if (currentUser) {
    displayMainPage();
    updateClicksLeft();
}
else {
    displayLoginForm();
}





