module.exports.populateCanvasNew = ({ digitalFrontDoorNumber, experimentName, deadline, contact, sNumber, duration, hypothesis, criticality, test, cost, dataReliability, metric, timeRequired, criteria, imageUrl, jiraTicketNumber }) => {
	return `<ac:layout><ac:layout-section ac:type=\"single\"><ac:layout-cell><h2>${experimentName}</h2>
	<ul>
	<li>Contact: ${contact} (${sNumber})</li>
	<li>Deadline: ${deadline}</li>
	<li>Duration: ${duration}</li>
	<li>Digital Front Door #: ${digitalFrontDoorNumber} / JIRA ticket #: <a href=\"https://jira.iag.com.au/browse/${jiraTicketNumber}\" target=\"blank_\">${jiraTicketNumber}</a></li>
	</ul>
	<p><ac:structured-macro ac:name="create-from-template" ac:schema-version="1" ac:macro-id="8f4da2de-d29b-4eb8-b1ce-6816b872b008"><ac:parameter ac:name="templateName">550633476</ac:parameter><ac:parameter ac:name="templateId">550633476</ac:parameter><ac:parameter ac:name="buttonLabel">Create Experiment Canvas</ac:parameter></ac:structured-macro></p><p><ac:structured-macro ac:name=\"html\">
	   <ac:plain-text-body> <![CDATA[<img height=\"\" width=\"\" src=\"${imageUrl.replace(/:/g, '&colon;')}\" />]]></ac:plain-text-body>
</ac:structured-macro></p>
<table class=\"relative-table wrapped\" style=\"width: 100%;\"><colgroup><col style=\"width: 20%;\" /><col style=\"width: 80%;\" />
	</colgroup><tbody>
	<tr><td class=\"highlight-blue\" colspan=\"1\" data-highlight-colour=\"blue\"><h2><strong>Hypothesis: We believe that</strong></h2></td><td colspan=\"1\"><h2><span><p>${hypothesis}</p><p>Critical: ${criticality}</p></span></h2></td></tr>
	<tr><td class=\"highlight-blue\" colspan=\"1\" data-highlight-colour=\"blue\"><h2><strong>Test: To verify that, we will</strong></h2></td><td colspan=\"1\"><h2><span><p>${test}</p><p>Test cost: ${cost}</p><p>Data reliability: ${dataReliability}</p></span></h2></td></tr>
	<tr><td class=\"highlight-blue\" colspan=\"1\" data-highlight-colour=\"blue\"><h2><strong>Metric: And measure</strong></h2></td><td colspan=\"1\"><h2><span><p>${metric}</p><p>Time required: ${timeRequired}</p></span></h2></td></tr>
	<tr><td class=\"highlight-blue\" data-highlight-colour=\"blue\"><h2><strong>Criteria: We are right if</strong></h2></td><td colspan=\"1\"><h2><span><p>${criteria}</p></span></h2></td>
		</tr></tbody></table></ac:layout-cell></ac:layout-section></ac:layout>`
};