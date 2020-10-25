/**
Save and restore a JSON object to and from local storage.
*/

export default {
	store : function(key, obj) {
		try {
			localStorage.setItem(key, JSON.stringify(obj))
			return true
		} catch (e) {
			return false
		}
	},
	restore : function(key, target = {}) {
		const obj = JSON.parse(localStorage.getItem(key))
		Object.assign(target, obj)
		return target
	},
	clear : function(key) {
		localStorage.removeItem(key)
	}
}

