$(function() {
	getInterviews(displayContents);
});

function getInterviews(callback) {
	$.ajax({
		method: 'GET',
		url: '/api/interviews/all'
	}).done(interviews => {
		callback(JSON.parse(interviews));
	});
}

function displayContents(interviews) {
	const defaultContent = $('.generic');
	interviews.forEach(interview => {
		var newContent = defaultContent.clone().removeClass('hidden');
		newContent.find('.card.header').text(interview['name']);
		newContent.find('.card.description').text(interview['description']);
		newContent.find('.enter.button').click(function() {
			enterInterview(interview);
		});
		$('.to-append').append(newContent);
	})
}

function enterInterview(interview) {
	window.location.href = "/practice?id=" + interview.id;
}