import React, {Fragment} from 'react';
import ProjectForm from './ProjectForm';
import Projects from './Projects';

export default function ProjectDashboard() {
    return (
        <Fragment>
            <ProjectForm />
            <Projects />
        </Fragment>
    )
}
