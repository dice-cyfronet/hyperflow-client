# HyperFlow Client

## Description

Client for, [Hyperflow](http://github.com/dice-cyfronet/hyperflow) based, workflow platform deployed on [PL-Grid](http://plgrid.pl) infrastructure.

## Availability

This software is currently available only for stand-alone installation.

## Usage

After installation the client is available as `hflowc` command, which accepts the following actions:

 * `apply` - creates an environment suitable for workflow execution
 * `destroy` - shuts down all machines associated with workflow execution

 Client is aware of what needs to be done to create and destroy execution environment though configuration file,
 which is supposed to be fund in current working directory. The configuration file should follow the provided example
 and contain at least two blocks of code describing provider and resources to be provisioned on the available infrastructure.
 Parameters of `provider` and `resources` are specific to the respective provider and resources, which it this case are
 components of hyperflow.

## Manual installation procedure

### Prerequisites:

 * any modern linux distro
 * nodejs ^0.10
 
### Obtaining the code

 * Clone the repository: `$ git clone https://github.com/dice-cyfronet/hyperflow-client.git`
 * Install dependencies: `$ npm install`

### Running

The Client is available as a script located here: `hyperflow-client/bin/hflowc`
