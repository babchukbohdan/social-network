import { UsernamePasswordInput } from './../resolvers/UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
    if (!options.email.includes('@')) {
        return [{
            field: "email",
            message: 'invalid email address',
        }]
    }
    if (options.username.includes('@')) {
        return [{
            field: "email",
            message: 'invalid username character @',
        }]
    }
    if (options.username.length <= 2) {
        return [{
            field: "username",
            message: 'length must be greater than 2'
        }]
    }
    if (options.password.length <= 2) {
        return [{
            field: "password",
            message: 'length must be greater than 2'
        }]
    }
    return null
}
