class TypeString {
    stringify(value) {
        return value ? value.toString() : ''
    }
    parse(value) {
        return value !== null && value !== undefined ? (value + '') : '';
    }
}

class TypeNumber {
    stringify(value) {
        return value ? value + '' : '';
    }
    parse(value) {
        return value ? value / 1 : 0;
    }
}

class TypeInteger {
    stringify(value) {
        return value ? value + '' : '';
    }
    parse(value) {
        return value ? parseInt(value) : 0;
    }
}

class TypeBigInt {
    stringify(value) {
        return value ? value + '' : '';
    }
    parse(value) {
        return value ? parseFloat(value) : 0;
    }
}

class TypeFloat {
    stringify(value) {
        return value ? value + '' : '';
    }
    parse(value) {
        return value ? parseFloat(value) : 0;
    }
}

class TypeDate {
    stringify(value) {
        return value ? value : new Date().getTime();
    }
    parse(value) {
        return new Date(value).getTime();
    }
}

class TypeJson {
    stringify(value) {
        return value ? value + '' : '';
    }
    parse(value) {
        return value ? parseFloat(value) : 0;
    }
}

class TypeBlob {
    stringify(value) {
        return value ? value + '' : '';
    }
    parse(value) {
        return value ? parseFloat(value) : 0;
    }
}

const Types = {
    STRING() {
        return new TypeString();
    },
    NUMBER() {
        return new TypeNumber();
    },
    INTEGER() {
        return new TypeInteger();
    },
    BIGINT() {
        return new TypeBigInt();
    },
    FLOAT() {
        return new TypeFloat();
    },
    DOUBLE() {
        return new TypeFloat();
    },
    DATE(a) {
        return new TypeDate(a);
    },
    JSON() {
        return new TypeJson();
    },
    BLOB() {
        return new TypeBlob();
    }
};

module.exports = Types;