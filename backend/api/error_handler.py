


def serializer_error_handler(errors: dict,message_key):
    
    key = list(errors.keys())[0]
    error = errors[key]
    formatted_key=key.replace("_"," ").title()
    if type(error) == list:
        message = f'{formatted_key} : {error[0]}'
    else:
        message = f'{formatted_key} - {error}'
    return {message_key:message}
