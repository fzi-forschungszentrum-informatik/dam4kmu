import React, {Fragment} from 'react';
import TaskForm from './TaskForm';
import Tasks from './Tasks';

export default function TaskDashboard() {
    return (
        <Fragment>
            <TaskForm />
            <Tasks />
        </Fragment>
    )
}