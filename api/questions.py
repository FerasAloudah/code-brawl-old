import time
from datetime import datetime, timedelta

ending_time = datetime.now()


class Question(object):
    def __init__(self, id, diff, answer):
        self.id = id
        self.diff = diff
        self.answer = answer

    def __repr__(self):
        return f'Question(id={self.id}, diff={self.diff}, answer={self.answer})'


def set_ending_time():
    global ending_time
    ending_time = datetime.now() + timedelta(seconds=60)
    for count in reversed(range(1, 61)):
        print(count)
        time.sleep(1)


def get_ending_time():
    return ending_time


def give_points(diff, time_left):
    muls = {
        'EASY': 1.0,
        'MEDIUM': 1.5,
        'HARD': 2.0
    }

    mul = muls[diff]

    if time_left > 45:
        points = 100 * mul
    elif time_left > 30:
        points = 75 * mul
    elif time_left > 15:
        points = 50 * mul
    else:
        points = 25 * mul

    return points


def get_time_left():
    return int(round((ending_time - datetime.now()).total_seconds()))


def post_answer(question, answer):
    time_left = get_time_left()

    answer_is_correct = False
    if answer_is_correct and time_left > 0:
        return give_points(question.diff, get_time_left())
    else:
        return 0
