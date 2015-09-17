# HyperFlow Client

## Description

Client for, [Hyperflow](http://github.com/dice-cyfronet/hyperflow) based, workflow platform deployed on [PL-Grid](http://plgrid.pl) infrastructure.

## Availability

This software is available pre-installed on [Zeus UI](https://docs.plgrid.pl/pages/viewpage.action?pageId=4260595), which is the intended environment for this software. Stand-alone installation is also possible, but it is not officially supported.

## Usage

Add custom directory of modules:

`$ export MODULEPATH=/mnt/gpfs/work/plgrid/groups/plgghflow/modules:$MODULEPATH`

Enable hflow-client module

`module add hflow-client`

The Client is now available as `hflowc` command, which accepts the following actions:

 * `setup` - creates a cloud environment suitable for workflow execution, the result is a running HyperFlow instance with a bunch of workers, this command spits out an "HyperFlow endpoint location" which is needed for workflow execution
 * `runwf` - executes a given workflow
 * `teardown` - shuts down all machines associated with workflow execution

## Manual installation procedure

### Prerequisites:

 * any modern linux distro
 * nodejs ^0.10
 
### Obtaining the code

 * Clone the repository: `$ git clone https://github.com/dice-cyfronet/hyperflow-client.git`
 * Install dependencies: `$ npm install`
 
### Configuration

The Client needs some basic configuration, which is done through the `hyperflow-client/lib/hflowc.config.js` config file.

### Running

The Client is available as a script located here: `hyperflow-client/bin/hflowc`
