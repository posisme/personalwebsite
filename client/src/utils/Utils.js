const Utils = {


    isMobile: () => {
        const userAgent = navigator.userAgent;
        return /Android|iOS|Mobile/i.test(userAgent);
    }
};

export default Utils;