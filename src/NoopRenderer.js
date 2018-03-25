import { Refs } from './Refs';
import { updateQueue } from './share';
//其他Renderer也要实现这些方法
var rootContainer = {
	children: []
};
function cleanChildren(array) {
	if (!Array.isArray(array)) {
		return array;
	}
	return array.map(function(el) {
		if (el.type == '#text') {
			return el.children;
		} else {
			return {
				type: el.type,
				props: el.props,
				children: cleanChildren(el.children)
			};
		}
	});
}
var rootContainer = {
	type: 'root',
	props: null,
	children: []
};
var yieldData = [];
export let NoopRenderer = {
	updateAttribute(fiber) {},
	updateContext(fiber) {
		fiber.stateNode.children = fiber.props.children;
	},
	reset() {
		rootContainer = {
			type: 'root',
			props: null,
			children: []
		};
	},
	render(vnode) {
		var instance;

		var hostRoot = {
			type: 'root',
			root: true,
			stateNode: rootContainer,
			props: {
				children: vnode
			},
			tag: 5,
			effectTag: 19, //CALLBACK
			alternate: rootContainer._reactInternalFiber,
			callback() {
				var fiber = this._reactInternalFiber;
				instance = fiber.child ? fiber.child.stateNode : null;
			}
		};
		updateQueue.push(hostRoot);
		Refs.workLoop({
			timeRemaining() {
				return 2;
			}
		});
		return instance;
	},
	getChildren() {
		return cleanChildren(rootContainer.children || []);
	},
	yield(a) {
		yieldData.push(a);
	},
	flush() {
		var ret = yieldData.concat();
		yieldData.length = 0;
		return ret;
	},
	createElement(fiber) {
		return {
			type: fiber.type,
			props: null,
			children: fiber.tag === 6 ? fiber.props.children : []
		};
	},
	insertElement(fiber) {
		let dom = fiber.stateNode,
			parentNode = fiber.parent,
			before = fiber.mountPoint,
			children = parentNode.children;
		try {
			if (before == null) {
				if (dom !== children[0]) {
					remove(children, dom)
					children.unshift(dom);
				}
			} else {
				if (dom !== children[children.length - 1]) {
					remove(children, dom)
					children.push(dom);
				}
			}
		} catch (e) {
			throw e;
		}
	},
	emptyElement(fiber) {
		// emptyElement(fiber.stateNode);
	},
	removeElement(fiber) {
		if (fiber.parent) {
			var parent = fiber.parent;
			var node = fiber.stateNode;
			remove(parent.children, node)
		} else {
			console.log('没有parent', fiber);
		}
	}
};
function remove(children, node) {
	var index = children.indexOf(node);
	if (index !== -1) {
		children.splice(index, 1);
	}
}
