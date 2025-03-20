import {Line} from 'react-chartjs-2'
import { Chart as ChartJs, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import { LineChartData } from './FAKE_DATA';

ChartJs.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const LineGraph = () => {
    const options = {};

    const data = {};

    return <Line options={options} data={LineChartData} />;
};