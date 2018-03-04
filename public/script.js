$(function() {
	$(".login.button").click(function() {
		$(".error").addClass("hidden");
		const username = $(".username").val();
		const password = $(".password").val();
		if(isEmpty(username) || isEmpty(password)) {
			$(".error").removeClass("hidden");
			return;
		}
		$.ajax({
			method: 'GET',
			url: '/api/login/username/' + username + '/password/' + password
		}).done(res => {
			console.log(res);
			if(res === 'OK') {
				window.location.href = "/list";
			}
			else {
				$(".error").removeClass("hidden");
			}
		});
	});
});

function isEmpty(str) {
    return (!str || 0 === str.length);
}