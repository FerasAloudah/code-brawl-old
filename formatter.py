from typing import *

def print_list(output):
    result = '['
    first = True

    for item in output:
        if first:
            result = f'{result}{get_string(item)}'
            first = False
        else:
            result = f'{result},{get_string(item)}'

    result += ']'
    return result


def get_string(item):
    if isinstance(item, str):
        return f'"{item}"'
    elif isinstance(item, List):
        return print_list(item)
    else:
        return item


def input_to_2d_list(string_list):
    result = []
    first = True

    inner_lists = strip_string(string_list).split('],[')

    for inner_list in inner_lists[:-1]:
        if first:
            result.append(input_to_list(inner_list + ']'))
            first = False
        else:
            result.append(input_to_list('[' + inner_list + ']'))

    result.append(input_to_list('[' + inner_lists[-1]))

    return result


def strip_string(string):
    return string[1:-1]


def format_bool(boolean):
    return str(boolean).lower()


def format_string(string):
    return f'"{string}"'


def input_to_list(string_list):
    result = []

    for item in strip_string(string_list).split(','):
        if '"' in item:
            item = item.strip()
            result.append(item[1:-1])
        else:
            result.append(int(item))

    return result


# print(print_list(input_to_list('["Hello", "Alaska", "Dad", "Peace"]')))
# print(input_to_2d_list('[[1,2,3],[4,5,6],[7,8,9]]'))
