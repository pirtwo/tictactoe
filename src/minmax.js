export default function minmax(node, type, depth) {
    let value;
    
    if (depth == 0 || node.isTerminal()) {        
        return node.getValue();
    }

    if (type == 'max') {
        value = -Infinity;        
        node.getChilds().forEach(child => {
            value = Math.max(value, minmax(child, 'min', depth - 1));
        });
    }

    if (type == 'min') {
        value = Infinity;        
        node.getChilds().forEach(child => {
            value = Math.min(value, minmax(child, 'max', depth - 1));
        });
    }

    return value;
}