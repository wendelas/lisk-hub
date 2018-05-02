import React from 'react';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';
import Waypoint from 'react-waypoint';
import { connect } from 'react-redux';
import { FontIcon } from '../fontIcon';
import { accountVotersFetched, accountVotesFetched } from '../../actions/account';
import routes from './../../constants/routes';
import styles from './delegateStatistics.css';

class DelegateStatistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showVotesNumber: 35,
      showVotersNumber: 35,
      loadAllVotes: false,
      votersFilterQuery: '',
      votesFilterQuery: '',
      votersSize: props.voters.length,
      votesSize: props.votes.length,
    };
  }

  loadMore() {
    this.setState({ showVotersNumber: this.state.showVotersNumber + 125 });
  }

  showAll() {
    this.setState({ loadAllVotes: true });
  }

  // putting <span>•</span> inbetween array objects
  putDotsInbetween(data) { // eslint-disable-line class-methods-use-this
    return data && data
      .reduce((arr, val) => [...arr, val, <span className={styles.dot} key={`span-${new Date().valueOf() * Math.random()}`}>• </span>], [])
      .slice(0, -1);
  }

  getInterspersed(dataName, filterQuery) {
    let data = this.props[dataName];
    data = data ? data.map((user, key) => (
      <Link className={`${styles.addressLink} ${styles.clickable} voter-address`}
        to={`${routes.explorer.path}${routes.accounts.path}/${user.address}`}
        key={`${key}-${dataName}`}>
        {`${user.username || user.address} `}
      </Link>
    )) : [];

    if (this.state[filterQuery] !== '') {
      data = data.filter((obj) => {
        const name = obj.props.children.trim();
        return name.includes(this.state[filterQuery]);
      });
    }
    return this.putDotsInbetween(data);
  }

  search(filterName, e) {
    const { value } = e.target;
    this.setState({
      [filterName]: value,
    });
  }

  renderSearchFilter(filterQuery, placeholder) {
    return (
      <div className={`${styles.search} ${styles.filter} search`}>
        <FontIcon className={styles.search} value='search' id='searchIcon'/>
        <input type='text'
          name='query'
          className={`search ${styles.desktopInput} ${this.state[filterQuery].length > 0 ? styles.dirty : ''} `}
          value={this.state[filterQuery]}
          onChange={this.search.bind(this, filterQuery)}
          placeholder={placeholder}/>
        <input type='text'
          name='query'
          className={`${styles.mobileInput} ${this.state[filterQuery].length > 0 ? styles.dirty : ''} `}
          value={this.state[filterQuery]}
          onChange={this.search.bind(this, filterQuery)}
          placeholder={this.props.t('Filter')}/>
      </div>
    );
  }

  render() {
    const { delegate, t } = this.props;
    let votesInterspered = this.getInterspersed('votes', 'votesFilterQuery');
    const votersInterspered = this.getInterspersed('voters', 'votersFilterQuery');

    const votesElementNumber = votesInterspered.length;
    if (votesInterspered) {
      votesInterspered = this.state.loadAllVotes ? votesInterspered :
        votesInterspered.slice(0, this.state.showVotesNumber);
    }

    const missed = this.props.t('missed');
    return (
      <div className={`${styles.details}`}>
        <div className={`transactions-detail-view ${grid.row} ${grid['between-md']} ${grid['between-sm']} ${styles.row}`}>
          <div className={`${grid['col-xs-12']} ${grid['col-sm-4']} ${grid['col-md-4']}`}>
            <div className={styles.label}>{this.props.t('Uptime')}</div>
            <div className={styles.value}>{delegate.productivity}%</div>
          </div>
          <div className={`${grid['col-xs-12']} ${grid['col-sm-4']} ${grid['col-md-4']}`}>
            <div className={styles.label}>{this.props.t('Rank')}</div>
            <div className={styles.value}>{delegate.rank}</div>
          </div>
          <div className={`${grid['col-xs-12']} ${grid['col-sm-4']} ${grid['col-md-4']}`}>
            <div className={styles.label}>{this.props.t('Approval')}</div>
            <div className={styles.value}>{delegate.approval}%</div>
          </div>
        </div>
        <div className={`transactions-detail-view ${grid.row} ${grid['between-md']} ${grid['between-sm']} ${styles.row}`}>
          <div className={`${grid['col-xs-12']} ${grid['col-sm-4']} ${grid['col-md-4']}`}>
            <div className={styles.label}>{this.props.t('Vote weight')}</div>
            <div className={styles.value}>{delegate.vote}</div>
          </div>
          <div className={`${grid['col-xs-12']} ${grid['col-sm-8']} ${grid['col-md-8']}`}>
            <div className={styles.label}>{this.props.t('Blocks')}</div>
            <div className={styles.value}>
              {`${delegate.producedblocks} (${delegate.missedblocks} ${missed})`}
            </div>
          </div>
        </div>
        <div className={`transactions-detail-view ${grid.row} ${grid['between-md']} ${grid['between-sm']} ${styles.row}`}>
          <div className={`${grid['col-xs-12']} ${grid['col-sm-12']} ${grid['col-md-12']}`}>
            <div className={styles.label}>
              <div>
                {this.props.t('Votes of this accont')}
                {` (${this.state.votesSize})`}
              </div>
              {this.renderSearchFilter('votesFilterQuery', t('Filter votes'))}
            </div>
            <div className={styles.value}>
              {votesInterspered}
            </div>
            {!this.state.loadAllVotes
              && this.state.votesFilterQuery === ''
              && votesElementNumber > this.state.showVotesNumber ?
              <div onClick={() => { this.showAll(); }} className={styles.showAll}>
                <FontIcon className={styles.arrowDown} value='arrow-down'/>
                {this.props.t('Show all')}
              </div> : ''
            }
          </div>
        </div>
        <div className={`transactions-detail-view ${grid.row} ${grid['between-md']} ${grid['between-sm']} ${styles.row}`}>
          <div className={`${grid['col-xs-12']} ${grid['col-sm-12']} ${grid['col-md-12']}`}>
            <div className={styles.label}>
              <div>
                {this.props.t('Who voted to this delegate')}
                {` (${this.state.votersSize})`}
              </div>
              {this.renderSearchFilter('votersFilterQuery', t('Filter voters'))}
            </div>
            <div className={styles.value}>
              {votersInterspered && votersInterspered
                .slice(0, this.state.showVotersNumber)}
            </div>
          </div>
        </div>
        <Waypoint
          bottomOffset='-20%'
          key='delegate-statistics'
          onEnter={() => {
            this.loadMore();
          }}></Waypoint>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  delegate: state.account.delegate || {},
  votes: state.account.votes || [],
  voters: state.account.voters || [],
  publicKey: state.account.delegate ? state.account.delegate.publicKey : null,
  peers: state.peers,
});

const mapDispatchToProps = dispatch => ({
  accountVotersFetched: data => dispatch(accountVotersFetched(data)),
  accountVotesFetched: data => dispatch(accountVotesFetched(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(DelegateStatistics));

