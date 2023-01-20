const https = require('https');
const httpsProxyAgent = require('https-proxy-agent');
const axios = require('axios');
const uuidv4 = require('uuid/v4');
const url = require('url')
const {TestError} = require('../../utils/validation/errors');
const {populateCanvas} = require('../../utils/templates/canvasTemplate');
const {populateCanvasNew} = require('../../utils/templates/canvasTemplateNew');
const {epicTasks} = require('../../utils/templates/jiraTasksTemplate');
const agent = new https.Agent({  
	rejectUnauthorized: false
});
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const authSysAgile = 'Basic c3lzX2FnaWxlOnN5c2FnaWxlMUBn';
const trelloLinkBase = 'https://api.trello.com';
const trelloKey = '62c97db9e1f49a30596e3108eb21a334';
const trelloToken  = 'cc553436e771c16c3204f1a8b400c8404b58c6a9d082813ee6a1e8257af17f10';
const trelloQuery = `key=${trelloKey}&token=${trelloToken}`;

const experimentsBoardId = '5afd02210199b240f6fb21c6';   // dev value 5ea103448a1018245e5e919f
/*
	0	
	id	"5c05b402afa9d532a5fe54df"
	name	"New ideas - Incoming Requests"
	1	
	id	"5b3182dbe136b994d68cfb55"
	name	"Awaiting prioritisation"
*/
const experimentsListAwaitingPrioritisation = '5b3182dbe136b994d68cfb55'
const customFieldsList = {
	raisedDate: {
		idCustomField: '5b21a5f22d6bbba2fff3f1df'
	},
	productOwner: {
		idCustomField: '5b21a60aaa33cd8a8f505a16'
	},
	jiraTicket: {
		idCustomField: '5b23584d9cfe1ce5fd5ccb6c'
	},
	expCanvas: {
		idCustomField: '5b2358b36d7da3b8cafadf49'
	},
	launchDate: {
		idCustomField: '5bece8a763ab8262bc7a2fcf'
	},
	expectedEndDate: {
		idCustomField: '5bece8b26b151762b0c65699'
	},
	criticality: {
		idCustomField: '5e0dcde387236f61b18fd189',
		options: {
			Low: '5e0dcde387236f61b18fd18a',
			Medium: '5e0dcde387236f61b18fd18b',
			High: '5e0dcde387236f61b18fd18c'
		}
	},
	testCost: {
		idCustomField: '5e0dce24c2f4186428fc2acc',
		options: {
			Medium: '5e0dce24c2f4186428fc2ace',
			High: '5e0dce24c2f4186428fc2acd'
		}
	},
	evidence: {
		idCustomField: '5e0dce6e96a7ee173b9b2685',
		options: {
			Low: '5e0dce6e96a7ee173b9b2686',
			Medium: '5e0dce6e96a7ee173b9b2687',
			High: '5e0dce6e96a7ee173b9b2688'
		}
	},
	effort: {
		idCustomField: '5e0dcec3bd08564d7b84f664',
		options: {
			Low: '5e0dcec3bd08564d7b84f667',
			Medium: '5e0dcec3bd08564d7b84f666',
			High: '5e0dcec3bd08564d7b84f665'
		}
	}
}

const createJiraEpic = ({ jiraForm, experimentDescription, auth }) => {
	return axios({
		method: 'post',
		url: 'https://jira.iag.com.au/rest/api/2/issue',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': auth
		},
		httpsAgent: agent,
		data: {
			update: {},
			fields: {
				project: {
					key: 'PER'
				},
				summary: `${jiraForm.experimentName}`,
				description: experimentDescription,
				issuetype: {
					name: 'Epic'
				},
				customfield_10405: {
					id: '32600'	//team Experiment Jedis
				},
				customfield_12101: jiraForm.experimentName,	//Epic name
				components: [{'name':'Experiment'}],
				reporter: {
					name: jiraForm.sNumber
				}
			}
		}
	})
};

const createConfluencePage = ({ canvas, value, auth, jiraTicketNumber }) => {
	return axios({
		method: 'post',
		url: 'https://confluence.iag.com.au/rest/api/content/',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': auth
		},
		httpsAgent: agent,
		data: {
			type:'page',
			title:`${jiraTicketNumber && `${jiraTicketNumber} - `}${canvas.experimentName}`,
			ancestors:[{'id': 330793244}],
			space:{'key':'PER'},
			body: {
				storage:{
					value: value,
					representation:'storage'
				}
			}
		}
	});
}

const editJiraTicket = ( confluenceURL, experimentDescription, auth, jiraTicketNumber ) => {
	return axios({
		method: 'put',
		url: 'https://jira.iag.com.au/rest/api/2/issue/' + jiraTicketNumber,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': auth
		},
		httpsAgent: agent,
		data: {
			fields: {
				description: experimentDescription + '\r\n\r\n Confluence link: ' + `https://confluence.iag.com.au/${confluenceURL}`
			}
		}
	});
}

const createTrelloTicket = ( canvas, trelloAxios ) => {
	const desc = `## :bulb: We believe that...\n ${canvas.hypothesis} \n## :mag_right: To verify that, we will...\n ${canvas.test}\n## :chart_with_upwards_trend:  And measure...\n ${canvas.metric}\n## :thumbsup:  We are right if...\n ${canvas.criteria}`;
	return trelloAxios.post('1/card', {
		idList: experimentsListAwaitingPrioritisation,
		name: (canvas.preTitleLabel && `[${canvas.preTitleLabel}] `) + canvas.experimentName,
		desc: desc,
		pos: 'bottom',
		idMembers: '',
		idLabels: (canvas.categories || []).join(),
		key: trelloKey,
		token: trelloToken
	})
}

const readTrelloCustomField = ( idCustomField, trelloAxios ) => trelloAxios.get('1/customFields/' + idCustomField + '?' + trelloQuery);

const updateTrelloCustomField = ( idCard, idCustomField, type, value, trelloAxios ) => {
	switch (type) {
		case 'text':
			data = { value: {text: value} }
			break;
		case 'date':
			data = { value: {date: value} }
			break;
		case 'list':
			data = { idValue: value }
			break;
		case 'number':
			data = { value: {number: value} }
			break;
		case 'checkbox':
			data = { value: {checked: value} }
			break;
		default:
			return;
		}
	return trelloAxios.put('1/cards/' + idCard + '/customField/' + idCustomField + '/item?' + trelloQuery, data);
}
/*
module.exports.experimentation = ({ canvas, jiraForm }) => {
	return new Promise(async (resolve, reject) => {
		try {
			const resEpic = await createJiraEpic({jiraForm});
			const resJiraTasks = await axios({
				method: 'post',
				url: 'https://jira.iag.com.au/rest/api/2/issue/bulk',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				httpsAgent: agent,
				data: {
					issueUpdates: epicTasks.map(task => {
						return (
							{
								update: {},
								fields: {
									project:
									{
										key: 'PER'
									},
									summary: task.summary,
									description: task.description,
									issuetype: {
										name: 'Task'
									},
									customfield_10405: {
										id: '32600'	//team Experiment Jedis
									},
									customfield_12100: resEpic.data.key, //Epic Link
									components: [{'name':'Experiment'}],
									reporter: {
										name: jiraForm.sNumber
									}
								}
							}
						);
					})
				}
			});
			canvas.jiraTicketNumber = resEpic.data.key;
			const resConfluence = await createConfluencePage({ canvas, value: populateCanvas(canvas) });

			resolve({
				response: {canvasUrl: resConfluence.data._links.webui},
				uuid: uuidv4()
			});
		}
		catch (error) {
			console.log(error)
			reject(new TestError('Whoops'));
		}
	});
};
*/
module.exports.experimentationNew = ({ canvas, jiraForm, authOld, createOptions }) => {
	return new Promise(async (resolve, reject) => {
		try {
			canvas.jiraTicketNumber = canvas.jiraTicketNumber || '';
			canvas.confluenceURL = canvas.confluenceURL || '';
			jiraError = '';
			confluenceError = '';

			auth = `Basic ${authOld}`

			// if (createOptions.includes('jira') || createOptions.includes('edit-jira')) {
			const jiraFormEscape = jiraForm;
			const jiraFormSymbolReplaceList = ["experimentName", "experimentDescription"];
			jiraFormSymbolReplaceList.forEach((property, index) => {jiraFormEscape[property] = jiraFormEscape[property].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');})
			// }

			var resEpic = resConfluence = trelloCard = {};
			if (createOptions.includes('jira')) {
				try {
					var resEpic = await createJiraEpic({ jiraForm, experimentDescription: jiraFormEscape.experimentDescription, auth: auth });
					//canvas.jiraTicketNumber = typeof resEpic !== 'undefined' ? resEpic.data.key || '' : '';
					canvas.jiraTicketNumber = (resEpic.data||{}).key || '';
				} catch (error) {
					console.log(error)
					jiraError = error.response.status
				}
			}
			else if (createOptions.includes('confluence')) {
				const canvasEscape = canvas;
				const canvasSymbolReplaceList = [ "digitalFrontDoorNumber", "experimentName", "deadline", "contact", "sNumber", "duration", "hypothesis", "test", "metric", "criteria" ];
				canvasSymbolReplaceList.forEach((property, index) => {canvasEscape[property] = canvasEscape[property].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');})
				try {
					var resConfluence = await createConfluencePage({ canvas, value: populateCanvasNew(canvasEscape), auth: auth, jiraTicketNumber: canvas.jiraTicketNumber });
					// canvas.confluenceURL = typeof resConfluence !== 'undefined' ? resConfluence.data._links.webui || '' : '';
					canvas.confluenceURL = ((resConfluence.data||{})._links||{}).webui || '';
				} catch (error) {
					console.log(error)
					confluenceError = error.response.status
				}
			}
			else if (createOptions.includes('edit-jira') && canvas.confluenceURL) {
				try {
					var resEditJira = await editJiraTicket( canvas.confluenceURL, jiraFormEscape.experimentDescription, auth, canvas.jiraTicketNumber )
				} catch (error) {
					console.log(error)
				}
			}	
			else if (createOptions.includes('trello')) {
				const proxyUrl = url.parse('http://' + Buffer.from(authOld, 'base64').toString('ascii') + '@proxy.auiag.corp:8080');
				proxyUrl.rejectUnauthorized = false;
				const proxyAgent = new httpsProxyAgent(proxyUrl)
				const trelloAxiosConfig = {
				    baseURL: trelloLinkBase,
				    proxy: false,
				    httpsAgent: proxyAgent
				};
				const trelloAxios = axios.create(trelloAxiosConfig);
				try {	
					var trelloCard = await createTrelloTicket(canvas, trelloAxios)
				} catch (error) {
					console.log(error)
				}
				var newCardId =  (trelloCard.data||{}).id || '';
				var trelloCardUrl = (trelloCard.data||{}).shortUrl || '';

				if (newCardId) {
					const customFieldsToUpdate = {
						raisedDate: new Date().toISOString(),
						productOwner: canvas.contact,
						criticality: customFieldsList['criticality']['options'][canvas.criticality] || '',
						effort: customFieldsList['effort']['options'][canvas.timeRequired] || '',
					}
					customFieldsToUpdate.testCost = customFieldsList['testCost']['options'][canvas.cost] || '';
					canvas.jiraTicketNumber && (customFieldsToUpdate.jiraTicket = `https://jira.iag.com.au/browse/${canvas.jiraTicketNumber}`);
					canvas.confluenceURL && (customFieldsToUpdate.expCanvas = `https://confluence.iag.com.au/${canvas.confluenceURL}`);

					for (const field in customFieldsToUpdate) {
						const customFieldId = customFieldsList[field]['idCustomField'];
						if (customFieldsToUpdate[field]) {
							try {
								const read = await readTrelloCustomField(customFieldId, trelloAxios);
								const updateCF = await updateTrelloCustomField(newCardId, customFieldId, read.data.type, customFieldsToUpdate[field], trelloAxios)
							} catch (error) {
								console.log(error)
							}
						}
					}
				}
			}

			resolve({
				response: {canvasUrl: canvas.confluenceURL, jiraTicketNumber: canvas.jiraTicketNumber, trelloCardUrl: trelloCardUrl, jiraError: jiraError, confluenceError: confluenceError},
				uuid: uuidv4()
			});
		}
		catch (error) {
			console.log(error)
			reject(new TestError('Whoops'));
		}
	});
};

module.exports.getTrelloLabels = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const proxyUrl = url.parse('http://proxy.auiag.corp:8080');
			proxyUrl.rejectUnauthorized = false;
			const proxyAgent = new httpsProxyAgent(proxyUrl);
			const trelloAxiosConfig = {
			    baseURL: trelloLinkBase,
			    proxy: false,
			    httpsAgent: proxyAgent
			};
			const trelloAxios = axios.create(trelloAxiosConfig);
			const request = await trelloAxios.get('1/boards/' + experimentsBoardId + '/labels?' + trelloQuery)
			const response_data = [];
			request.data.forEach(label => {
				response_data.push({
					label: label.name,
					value: label.id
				});
			});
			resolve({
				response: {
					result: response_data
				},
				uuid: uuidv4()
			});
		}
		catch (error) {
			resolve({
				response: {
					result: [],
					error: error
				},
				uuid: uuidv4()
			});
		}
	});
};

module.exports.getJiraUserName = ( username = '' ) => {
	return new Promise(async (resolve, reject) => {
		try {
			const request = await
				axios({
					method: 'get',
					url: 'https://jira.iag.com.au/rest/api/2/user?username=' + username,
					headers: {	
						'Content-Type': 'application/json',
						'Authorization': authSysAgile
					},
					httpsAgent: agent
				});
			resolve({
				response: {
					result: {
						status: 'success',
						validated: username
					},
					value: request.data.displayName
				},
				uuid: uuidv4()
			});
		}
		catch (error) {
			// console.log(error.response)
			resolve({
				response: {
					result: {
						status: 'warning',
						validated: username
					},
					value: error.response.data.errorMessages[0]
				},
				uuid: uuidv4()
			});
		}
	});
};

module.exports.statusBoard = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await axios({
				method: 'post',
				url: 'https://jira.iag.com.au/rest/api/2/search',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authSysAgile
				},
				httpsAgent: agent,
				data: {
					jql: "project = PER AND 'Workstream/Team'  = 'Experiment Jedis' AND Type = Epic AND component = Experiment AND ( (Status = 'Backlog' AND updated > -90d) OR updated > -30d)",
					startAt: 0,
					maxResults: 100,
					fields: [
						'summary',
						'status',
						'reporter'
					]
				}
			});
			const mappedResponse = [];
			response.data.issues.forEach(issue => {
				mappedResponse.push({
					epicName: issue.fields.summary,
					reporter: issue.fields.reporter.displayName,
					status: issue.fields.status.name,
					jiraTicket: issue.key
				});
			});
			resolve({
				response: mappedResponse,
				uuid: uuidv4()
			});
		}
		catch (error) {
			reject(new TestError('Whoops'));
		}
	});
};

module.exports.test = () => {
	return new Promise(async (resolve, reject) => {
		try {
			resolve({
				response: 'SUCCESS',
				uuid: uuidv4()
			});
		}
		catch (error) {
			reject(new TestError('Whoops'));
		}
	});
};