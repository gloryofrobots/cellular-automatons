
const IF = (props) => {
    if (props.isTrue) {
        return (
            props.isTrue() === true ? props.children : null
        );
    } 
    if (props.isFalse) {
        return (
            props.isFalse() === false ? props.children : null
        );
    }

    return (
        props.children
    );
};


export {IF}