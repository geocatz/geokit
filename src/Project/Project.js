import React from 'react'
import PropTypes from 'prop-types'
import { connectToContext } from 'Provider'
import { ProjectMenuContainer } from './styled'
import { createProject, loadProject } from './utils'

/** A project save/load component
 * @component
 * @category Project
 * @since 1.9.0
 */
class ProjectMenu extends React.Component {
  onCreateProject = async () => {
    const { map } = this.props

    const projectFile = await createProject(map)
    // download the project file to local machine
    console.log(projectFile) // eslint-disable-line no-console
    const dataString = `data:text/htmlcharset=utf-8,${encodeURIComponent(projectFile)}`
    const downloadAnchorElement = document.getElementById('_ol_kit_project_download_anchor')

    downloadAnchorElement.setAttribute('href', dataString)
    downloadAnchorElement.setAttribute('download', 'ol_kit_project.html')
    downloadAnchorElement.click()
  }

  onLoadProject = async () => {
    console.log('loading') // eslint-disable-line no-console
    const { map } = this.props
    const upload = document.getElementById('myFile')
    const reader = new FileReader()

    reader.addEventListener('load', e => {
      const data = e.target.result
      console.log(data) // eslint-disable-line no-console
      const el = document.createElement('html')
      el.innerHTML = data
      const project = el.getElementsByTagName('div')[0].innerHTML
      const projectString = project.substring(1, project.length - 1)

      loadProject(map, JSON.parse(projectString))
    })
    reader.readAsBinaryString(upload.files[0])
  }

  render () {
    return (
      <ProjectMenuContainer id={'projects'}>
        <a id='_ol_kit_project_download_anchor' style={{ display: 'none' }}></a>
        <button id='_ol_kit_create_project' onClick={this.onCreateProject}>Create a project</button>
        <input type='file' id='myFile' accept='.html' onChange={this.onLoadProject} />
      </ProjectMenuContainer>
    )
  }
}

ProjectMenu.propTypes = {
  /** a reference to openlayers map object */
  map: PropTypes.object.isRequired
}

export default connectToContext(ProjectMenu)
