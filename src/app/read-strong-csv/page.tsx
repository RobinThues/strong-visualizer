'use client';

import Papa from "papaparse";
import {useState} from "react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {faker} from "@faker-js/faker";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Chart.js Bar Chart',
        },
    },
};


let data = {
    labels: ["Bench", "Lift", "Squat"],
    datasets: [
        {
            label: 'Exercises',
            data: [1, 2, 3],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
    ],
};

type Workouts = Workout[]
interface Workout {
    date: string
    workoutName: string
    exercises: Exercises
}

type Exercises = Exercise[]
interface Exercise {
    exerciseName: string
    weightUnit: string
    sets: Sets
}

type Sets = Set[]
interface Set {
    setOrder: number
    weight: number
    reps: number
}

interface csvRow {
    date: string
    workoutName: string
    exerciseName: string
    setOrder: number
    weight: number
    weightUnit: string
    reps: number
}

const mapResultsToCsvRows = (resultData: any[]) => {
    return resultData.map((d) => ({
        date: d.Date,
        workoutName: d["Workout Name"],
        exerciseName: d["Exercise Name"],
        setOrder: d["Set Order"],
        weight: d.Weight,
        weightUnit: d["Weight Unit"],
        reps: d.Reps,
    }) as csvRow);
}

function App() {
    // State to store parsed data
    const [parsedData, setParsedData] = useState([]);

    //State to store table Column name
    const [tableRows, setTableRows] = useState([]);

    //State to store the values
    const [values, setValues] = useState([]);

    const [readData, setReadData] = useState([])


    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target

        if (!input.files?.length) {
            //TODO: some error handling
            return;
        }

        const file = input.files[0];

        Papa.parse(
            file, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    const rowsArray: any[] = [];
                    const valuesArray: any[] = [];

                    results.data.map((d: any) => {
                        rowsArray.push(Object.keys(d));
                        valuesArray.push(Object.values(d));
                    });

                    const csvRows = mapResultsToCsvRows(results.data);
                    console.log("workout sets: ", csvRows);

                    let workout: csvRow[] = [];
                    let workoutHistory: csvRow[][] = [];


                    // workoutHistory contains Workouts
                    // workouts contain excercises
                    // excersises contain sets
                    // sets contain weight/reps/etc

                    for (let i = 0; i < csvRows.length; i++) {
                        // first entry is always a new workout
                        if (i === 0) {
                            workout.push(csvRows[i]);
                        } else {
                            // if current entry is from the same date as the one before, add to workout
                            if (csvRows[i].date === csvRows[i-1].date) {
                                workout.push(csvRows[i]);
                            } else {
                                // different date: persist the previous workout to history
                                // add current entry to new workout
                                workoutHistory.push(workout);
                                workout = [csvRows[i]];
                            }
                        }
                        // if last entry, save last workout to workout history
                        if (i === csvRows.length-1) workoutHistory.push(workout);
                    }
                    console.log("workoutHistory, after for: ", workoutHistory.length, workoutHistory);
                    setReadData([1 as never, 2 as never]);

                    data = {
                        labels: csvRows.map((ws) => ws.exerciseName),
                        datasets: [
                            {
                                label: 'exercises',
                                data: csvRows.map((ws) => ws.weight),
                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            },
                        ],
                    }

                    // Parsed Data Response in array format
                    setParsedData(results.data as any);

                    // Filtered Column Names
                    setTableRows(rowsArray[0]);
                    // Filtered Values
                    setValues(valuesArray as never[]);
                },
            });
    };
    return (
        <div>
            {/* File Uploader */}
            <input
                type="file"
                name="file"
                accept=".csv"
                onChange={changeHandler}
                style={{ display: "block", margin: "10px auto" }}
            />
            <br />
            { readData.length > 0 && <Bar options={options} data={data} redraw={true} />}
            <br />
            {/* Table */}
            <table>
                <thead>
                <tr>
                    {tableRows.map((rows, index) => {
                        return <th key={index}>{rows}</th>;
                    })}
                </tr>
                </thead>
                <tbody>
                {values.map((value, index) => {
                    return (
                        <tr key={index}>
                            {(value as any[]).map((val, i) => {
                                return <td key={i}>{val}</td>;
                            })}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

export default App;