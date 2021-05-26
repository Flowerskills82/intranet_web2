import Amplify, { Auth, API, graphqlOperation } from "aws-amplify";

import awsconfig from "./aws-exports";
import * as mutations from "./graphql/mutations";
import * as queries from "./graphql/queries";
import { Side } from "./models"

Amplify.configure(awsconfig);

/**
 * Perform a sign up against Amazon Amplify with the given user and password.
 */
async function signIn() {
    try {
        const user = await Auth.signIn("kugoad@gmail.com", "nuevapassword");
    } catch (error) {
        console.log("Error signing in", error);
        alert(error.message);
    }
}

/**
 * The list of available models.
 */
const modelNames = ["patient", "center"];

/**
 * Defines the different models available in the application to create their tables easily.
 */
const models = {
    patient: {
        fields: [
            "owner",
            "user_id",
            "tutor_id",
            "therapist_id",
            "birth_date",
            "birth_city",
            "birth_country",
            "familiy_name_father",
            "familiy_name_mother",
            "familiy_members_number",
            "school_postal_address",
            "school_integration",
            "sessions_weekly",
            "sessions_current",
            "sessions_total",
            "affection_side",
            "affection_start",
            "affection_details",
            "concurrent_pathologies",
            "allergies",
            "surgeries",
            "botulinum_toxin",
            "therapies_week_physiontherapy",
            "therapies_week_occupational",
            "therapies_week_speach",
            "therapies_week_neuropsychology",
            "therapies_week_psychotherapy",
            "therapies_compl_dry_neeling",
            "therapies_compl_psychomotor_skills",
            "therapies_compl_early_intervention",
            "therapies_compl_sensory",
            "therapies_compl_therasuit",
            "therapies_compl_music",
            "therapies_compl_hippotherapy",
            "therapies_compl_resporatory",
            "therapies_compl_cimt",
            "therapies_compl_kinesiotape",
            "therapies_compl_wii",
            "therapies_compl_virtual_reality",
            "therapies_compl_inrobics",
            "therapies_compl_assistive_robotics",
            "therapies_compl_adappted_sport",
            "support_product_crutches",
            "support_product_walking_stick",
            "support_product_anklet",
            "support_product_adapted_mouse",
            "support_product_aac",
            "support_product_writing_adaption",
            "support_product_wheelchair",
            "support_product_hand_splint"
        ],
        listFunction: queries.listPatients,
        listFunctionName: "listPatients",
        deleteFunction: mutations.deletePatient,
        createFunction: mutations.createPatient,
        updateFunction: mutations.updatePatient
    },
    center: {
        fields: [
            "owner",
            "name",
            "email",
            "postal_address",
            "phone",
            "city"
        ],
        listFunction: queries.listCenters,
        listFunctionName: "listCenters",
        deleteFunction: mutations.deleteCenter,
        createFunction: mutations.createCenter,
        updateFunction: mutations.updateCenter
    }
}

/**
 * Refresh the full view for the given model.
 *
 * @param modelName The name of the model to fill the view.
 */
async function refreshView(modelName) {
    setCreateButton(modelName);
    setUpdateButton(modelName);
    refreshCreationForm(modelName);
    refreshTable(modelName);
}

/**
 * Set the listener to update models on click on the update button.
 */
function setUpdateButton(modelName) {
    let createButton = document.getElementById("update-form-button");

    // If the create button is clicked, read the non-empty fields from the form
    // and try to create a new row in the DB.
    createButton.onclick = function() {
        let formElements = document.getElementById("update-form").elements;
        let modelInstance = {};

        // Read all the form fields into modelInstance.
        for (let i = 0; i < formElements.length; i++) {
            let item = formElements.item(i);

            // Do not include empty values.
            if (item.value === "") continue;

            modelInstance[item.name] = item.value;
        }

        // Create the model instance and after that refresh the table and close the modal.
        API.graphql(graphqlOperation(models[modelName].updateFunction, { input: modelInstance })).then((evt) => {
            document.getElementById("update-form-close").click();
            refreshTable(modelName);
        }).catch((error) => {
            console.log(error);
            alert(error.errors[0].message);
        });
    };
}

/**
 * Set the listener to create new models on click on the create button.
 */
function setCreateButton(modelName) {
    let createButton = document.getElementById("creation-form-button");

    // If the create button is clicked, read the non-empty fields from the form
    // and try to create a new row in the DB.
    createButton.onclick = function() {
        let formElements = document.getElementById("creation-form").elements;
        let modelInstance = {};

        // Read all the form fields into modelInstance.
        for (let i = 0; i < formElements.length; i++) {
            let item = formElements.item(i);

            // Do not include empty values.
            if (item.value === "") continue;

            modelInstance[item.name] = item.value;
        }

        // Create the model instance and after that refresh the table and close the modal.
        API.graphql(graphqlOperation(models[modelName].createFunction, { input: modelInstance })).then((evt) => {
            document.getElementById("creation-form-close").click();
            refreshTable(modelName);
        }).catch((error) => {
            console.log(error);
            alert(error.errors[0].message);
        });
    };
}

/**
 * Refresh the update form for the given instance.
 *
 * @param modelName The name of the model to fill the form.
 * @param modelInstance The instance to use as base for update.
 */
function refreshUpdateForm(modelName, modelInstance) {
    let updateForm = document.getElementById("update-form");

    // Clear the form content.
    updateForm.innerHTML = "";

    // Add the ID field as hidden.
    let idInput = document.createElement("input");
    idInput.setAttribute("name", "id");
    idInput.setAttribute("type", "hidden");
    idInput.value = modelInstance["id"];
    updateForm.appendChild(idInput);

    // Fill the form with every field for this model.
    models[modelName].fields.forEach((field, index) => {
        // Do not include owner field in the form.
        if (field === "owner") return;

        // Create label for field.
        let label = document.createElement("label");
        label.setAttribute("for", field);
        label.textContent = field + ":";
        label.classList.add("col-form-label");

        // Create input for field.
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("name", field);
        input.classList.add("form-control");
        input.value = modelInstance[field];

        // Add the label and input to the form.
        updateForm.appendChild(label);
        updateForm.appendChild(input);
    });
}

/**
 * Refresh the creation form with the fields of the given model.
 *
 * @param modelName The name of the model to fill the form.
 */
function refreshCreationForm(modelName) {
    let creationForm = document.getElementById("creation-form");

    // Clear the form content.
    creationForm.innerHTML = "";

    // Fill the form with every field for this model.
    models[modelName].fields.forEach((field, index) => {
        // Do not include owner field in the form.
        if (field === "owner") return;

        // Create label for field.
        let label = document.createElement("label");
        label.setAttribute("for", field);
        label.textContent = field + ":";
        label.classList.add("col-form-label");

        // Create input for field.
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("name", field);
        input.classList.add("form-control");

        // Add the label and input to the form.
        creationForm.appendChild(label);
        creationForm.appendChild(input);
    });
}

/**
 * Refresh the management table with the contents of the given model.
 * @param modelName The model we want to display in the table.
 */
async function refreshTable(modelName) {
    const tableHeader = document.getElementById("management-table-header");
    const tableBody = document.getElementById("management-table-body");

    const model = models[modelName];

    // CleanUp the table header
    tableHeader.innerHTML = "";

    // Iterate over all the fields of this model just to add the header to the table.
    let header = document.createElement("tr")
    let column = document.createElement("th");
    column.textContent = "Options";
    column.setAttribute("scope", "col");
    header.appendChild(column);

    model.fields.forEach((field, index) => {
        let column = document.createElement("th");
        column.textContent = field;
        column.setAttribute("scope", "col");
        header.appendChild(column);
    });
    tableHeader.appendChild(header);

    // CleanUp the table body
    tableBody.innerHTML = "";

    return await API.graphql(graphqlOperation(model.listFunction)).then((evt) => {
        // Iterate over all the items for this model and write them in the table body.
        evt.data[model.listFunctionName].items.map((modelInstance, index) => {
            let row = document.createElement("tr")

            let optionsColumn = document.createElement("td");

            // Add the delete button to the options column.
            let deleteButton = createDeleteButton(modelName, modelInstance);
            optionsColumn.appendChild(deleteButton);

            // Add the edit button to the options column.
            let editButton = createEditButton(modelName, modelInstance);
            optionsColumn.appendChild(editButton);

            // Add the options column to the row.
            row.appendChild(optionsColumn);

            // Add the rest of the model fields to the row.
            model.fields.forEach((field, index) => {
                let column = document.createElement("td");
                column.textContent = modelInstance[field];
                row.appendChild(column);
            });
            tableBody.appendChild(row);
        })
    });
}

/**
 * Creates a delete button to delete an instance.
 *
 * @param modelName The type of the model to delete.
 * @param modelInstance The model instance to delete.
 */
function createDeleteButton(modelName, modelInstance) {
    // Create the HTML icon for the delete button.
    let deleteButton = document.createElement('span');
    ["glyphicon", "glyphicon-remove"].forEach((className, index) => {
        deleteButton.classList.add(className);
    });

    // On click send a delete request to Amplify API.
    deleteButton.onclick = function() {
        // The delete function expects only the input of the instance to delete.
        const deletePatientInput = { id: modelInstance["id"]  };

        // Delete the model instance on Amplify and on success refresh the table.
        API.graphql({ query: models[modelName].deleteFunction, variables: { input: deletePatientInput } }).then((evt) => {
            refreshTable(modelName);
        }).catch((error) => {
            console.log(error);
            alert(error.errors[0].message);
        });
    };

    // Return the just created delete button.
    return deleteButton;
}


/**
 * Creates a update button for each instance to edit the objects.
 *
 * @param modelName The type of the model to delete.
 * @param modelInstance The model instance to delete.
 */
function createEditButton(modelName, modelInstance) {
    // Create the HTML icon for the delete button.
    let editButton = document.createElement('span');
    ["glyphicon", "glyphicon-edit"].forEach((className, index) => {
        editButton.classList.add(className);
    });

    // On click refresh the update form and click on the hidden update modal to show the modal.
    editButton.onclick = function() {
        refreshUpdateForm(modelName, modelInstance);
        document.getElementById("update-button").click();
    };

    // Return the just created delete button.
    return editButton;
}

/**
 * Setup the navbar with all the models.
 */
function setUpNavBar() {
    let navBar = document.getElementById("models");
    modelNames.forEach((name, index) => {
        // Create a li to add to navBar.
        let modelElem = document.createElement("li");
        modelElem.classList.add("nav-item");

        // Create the a link to add to modelElem.
        let modelLink = document.createElement("a");
        modelLink.classList.add("nav-link");
        modelLink.classList.add("active");
        modelLink.textContent = name;

        // Set the function to perform on click.
        modelLink.addEventListener('click', () => {
            refreshView(name);
        });

        // Add the link to modelElem, and modelElem inside the navBar.
        modelElem.appendChild(modelLink);
        navBar.appendChild(modelElem);
    });
}


setUpNavBar();
signIn().then((evt) => {
    refreshView("patient").then((evt) => console.log("Table Refreshed"));
});