import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

// Interface for component props, expecting an array of ServerRespond
interface IProps {
    data: ServerRespond[],
}

// Extend HTMLElement to include load method for PerspectiveViewer
interface PerspectiveViewerElement extends HTMLElement {
    load: (table: Table) => void,
}

class Graph extends Component<IProps, {}> {
    table: Table | undefined; // Table instance to hold the Perspective table

    // Render method to create PerspectiveViewer element
    render() {
        return React.createElement('perspective-viewer');
    }

    // Lifecycle method that runs after the component mounts
    componentDidMount() {
        // Get the first perspective-viewer element from the DOM
        const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

        // Define the schema for the Perspective table
        const schema = {
            price_abc: 'float',
            price_def: 'float',
            ratio: 'float',
            timestamp: 'date',
            upper_bound: 'float',
            lower_bound: 'float',
            trigger_alert: 'float'
        };

        // Create a new Perspective worker and table if available
        if (window.perspective && window.perspective.worker()) {
            this.table = window.perspective.worker().table(schema);
        }

        // If the table is successfully created, load it into the viewer
        if (this.table) {
            elem.load(this.table); // Load the table data
            elem.setAttribute('view', 'y_line'); // Set the view type
            elem.setAttribute('row-pivots', '["timestamp"]'); // Define row pivots
            elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'); // Define visible columns
            elem.setAttribute('aggregates', JSON.stringify({
                price_abc: 'avg', // Aggregate function for price_abc
                price_def: 'avg', // Aggregate function for price_def
                ratio: 'avg', // Aggregate function for ratio
                timestamp: 'distinct count', // Aggregate function for timestamp
                upper_bound: 'avg', // Aggregate function for upper_bound
                lower_bound: 'avg', // Aggregate function for lower_bound
                trigger_alert: 'avg' // Aggregate function for trigger_alert
            }));
        }
    }

    // Lifecycle method that runs when the component updates
    componentDidUpdate() {
        if (this.table) {
            // Update the Perspective table with new data generated from the incoming props
            this.table.update([
                DataManipulator.generateRow(this.props.data), // Generate and pass the new row
            ] as unknown as TableData); // Ensure the data type matches expected TableData
        }
    }
}

export default Graph;